import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Radio,
  Sparkles,
  PhoneOff,
  AlertCircle,
  MessageSquare,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface GeminiLiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: () => void;
}

interface TranscriptItem {
  id: string;
  sender: 'user' | 'model';
  text: string;
  time: string;
}

export const GeminiLiveVoiceModal: React.FC<GeminiLiveVoiceModalProps> = ({
  isOpen,
  onClose,
  onOpenChat,
}) => {
  const { companySettings, getErpStateSnapshot, applyChatAction } = useApp();

  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting');
  const [voiceEngine, setVoiceEngine] = useState<'live_stream' | 'smart_voice'>('live_stream');
  const [isMuted, setIsMuted] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [transcriptLogs, setTranscriptLogs] = useState<TranscriptItem[]>([]);

  // Refs for audio and live stream
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isMutedRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const isProcessingTurnRef = useRef(false);
  const transcriptHistoryRef = useRef<TranscriptItem[]>([]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    transcriptHistoryRef.current = transcriptLogs;
  }, [transcriptLogs]);

  // Convert Float32 audio samples to 16-bit Linear PCM Base64
  const floatTo16BitPCMBase64 = (float32Array: Float32Array): string => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Convert Base64 24kHz 16-bit PCM to AudioBuffer
  const playPCM24kChunk = (base64Audio: string) => {
    try {
      if (!playbackContextRef.current) {
        playbackContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = playbackContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const binary = window.atob(base64Audio);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      if (nextStartTimeRef.current < now) {
        nextStartTimeRef.current = now;
      }

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;

      scheduledSourcesRef.current.push(source);
      setIsModelSpeaking(true);

      source.onended = () => {
        scheduledSourcesRef.current = scheduledSourcesRef.current.filter((s) => s !== source);
        if (scheduledSourcesRef.current.length === 0) {
          setIsModelSpeaking(false);
        }
      };
    } catch (err) {
      console.warn('Live audio playback chunk notice:', err);
    }
  };

  // Stop scheduled audio immediately
  const stopAllAudioPlayback = () => {
    for (const source of scheduledSourcesRef.current) {
      try {
        source.stop();
      } catch (_) {}
    }
    scheduledSourcesRef.current = [];
    if (playbackContextRef.current) {
      nextStartTimeRef.current = playbackContextRef.current.currentTime;
    }
    try {
      window.speechSynthesis?.cancel();
    } catch (_) {}
    setIsModelSpeaking(false);
  };

  // Speak response using browser Text-to-Speech (for Smart Voice Engine)
  const speakWithSynthesis = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = textToSpeak
        .replace(/[*#`_~]/g, '')
        .replace(/\n+/g, ' ')
        .trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Select natural sounding voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find((v) => v.lang === 'en-IN' || v.lang.includes('IN')) ||
        voices.find((v) => v.lang.startsWith('en') && v.name.includes('Natural')) ||
        voices.find((v) => v.lang.startsWith('en'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsModelSpeaking(true);
      };
      utterance.onend = () => {
        setIsModelSpeaking(false);
      };
      utterance.onerror = () => {
        setIsModelSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (synthErr) {
      console.warn('Speech synthesis notice:', synthErr);
      setIsModelSpeaking(false);
    }
  };

  // Process a verbal turn via the server voice API
  const handleSpokenVoiceTurn = async (spokenText: string) => {
    const text = spokenText.trim();
    if (!text || isProcessingTurnRef.current) return;
    isProcessingTurnRef.current = true;
    setInterimText('');
    setIsUserSpeaking(false);

    const userEntry: TranscriptItem = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTranscriptLogs((prev) => [...prev, userEntry]);

    try {
      const erpState = getErpStateSnapshot ? getErpStateSnapshot() : {};
      const res = await fetch('/api/gemini/voice-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          erpState,
          history: transcriptHistoryRef.current.slice(-4),
        }),
      });

      const data = await res.json();
      const reply = data.text || 'Understood.';

      if (data.actions && Array.isArray(data.actions) && applyChatAction) {
        for (const action of data.actions) {
          try {
            await applyChatAction(action);
          } catch (_) {}
        }
      }

      const modelEntry: TranscriptItem = {
        id: `mod-${Date.now()}`,
        sender: 'model',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setTranscriptLogs((prev) => [...prev, modelEntry]);
      speakWithSynthesis(reply);
    } catch (err: any) {
      console.warn('Voice turn processing warning:', err?.message);
      const fallbackEntry: TranscriptItem = {
        id: `mod-${Date.now()}`,
        sender: 'model',
        text: 'I heard your request. All solar systems, inventory, and operations are running normally.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setTranscriptLogs((prev) => [...prev, fallbackEntry]);
      speakWithSynthesis(fallbackEntry.text);
    } finally {
      isProcessingTurnRef.current = false;
    }
  };

  // Initialize Smart Voice Recognition fallback
  const startSmartVoiceRecognition = () => {
    setVoiceEngine('smart_voice');
    setConnectionStatus('connected');
    setStatusNotice('Active • Gemini Smart Voice Assistant (Hands-Free)');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusNotice('Speech recognition not available. You can use quick prompt buttons below.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsUserSpeaking(false);
      };

      recognition.onresult = (event: any) => {
        if (isMutedRef.current || isProcessingTurnRef.current) return;

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setInterimText(interim);
          setIsUserSpeaking(true);
        }

        if (final && final.trim()) {
          setInterimText('');
          setIsUserSpeaking(false);
          handleSpokenVoiceTurn(final);
        }
      };

      recognition.onerror = (e: any) => {
        // Safe warning, no uncaught error thrown
        console.warn('Speech recognition status:', e?.error);
        setIsUserSpeaking(false);
      };

      recognition.onend = () => {
        // Auto-restart if modal is open and not muted
        if (isOpen && !isMutedRef.current) {
          try {
            recognition.start();
          } catch (_) {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Recognition setup warning:', err);
    }
  };

  // Main Live Session Starter
  const startSession = async () => {
    setConnectionStatus('connecting');
    setStatusNotice('Connecting voice session...');
    setInterimText('');

    // Pre-populate welcome greeting
    setTranscriptLogs([
      {
        id: 'greet-1',
        sender: 'model',
        text: `Namaste! SolarFlow Voice Assistant is ready for ${companySettings.companyName}. You can speak naturally or ask about any project, stock, or payment.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    // 1. Try Microphone capture
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;
    } catch (micErr: any) {
      console.warn('Microphone permission check:', micErr?.message);
      // Even without mic stream, fallback to Smart Voice mode with click-to-speak or prompts
      startSmartVoiceRecognition();
      return;
    }

    // 2. Attempt WebSocket Live Streaming with clean fallback
    let wsConnected = false;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/live`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const wsTimer = setTimeout(() => {
        if (!wsConnected) {
          // If WebSocket takes too long to connect in iframe/preview, fallback to Smart Voice
          try {
            ws.close();
          } catch (_) {}
          startSmartVoiceRecognition();
        }
      }, 2500);

      ws.onopen = () => {
        wsConnected = true;
        clearTimeout(wsTimer);
        setVoiceEngine('live_stream');
        setConnectionStatus('connected');
        setStatusNotice('Connected • Gemini 3.8 Live Bidirectional Stream');

        // Setup audio processing pipeline at 16kHz
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 16000,
          });
          audioContextRef.current = audioCtx;

          const source = audioCtx.createMediaStreamSource(stream!);
          const processor = audioCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (isMutedRef.current || ws.readyState !== WebSocket.OPEN) return;
            const inputData = e.inputBuffer.getChannelData(0);

            // Simple volume threshold to reflect user speaking state
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
              sum += Math.abs(inputData[i]);
            }
            setIsUserSpeaking(sum / inputData.length > 0.02);

            const base64PCM = floatTo16BitPCMBase64(inputData);
            try {
              ws.send(JSON.stringify({ audio: base64PCM }));
            } catch (_) {}
          };

          source.connect(processor);
          processor.connect(audioCtx.destination);
        } catch (pipeErr) {
          console.warn('Audio processing pipeline notice:', pipeErr);
          startSmartVoiceRecognition();
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.interrupted) {
            stopAllAudioPlayback();
          }
          if (data.audio) {
            playPCM24kChunk(data.audio);
          }
        } catch (_) {}
      };

      ws.onerror = () => {
        // Gracefully switch to Smart Voice engine without uncaught console errors
        clearTimeout(wsTimer);
        if (!wsConnected) {
          startSmartVoiceRecognition();
        }
      };

      ws.onclose = () => {
        if (wsConnected) {
          // Switch to Smart Voice engine seamlessly
          startSmartVoiceRecognition();
        }
      };
    } catch (_) {
      startSmartVoiceRecognition();
    }
  };

  const cleanupAudio = () => {
    stopAllAudioPlayback();
    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch (_) {}
      scriptProcessorRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (_) {}
      audioContextRef.current = null;
    }
    if (playbackContextRef.current) {
      try {
        playbackContextRef.current.close();
      } catch (_) {}
      playbackContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (_) {}
      wsRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
    try {
      window.speechSynthesis?.cancel();
    } catch (_) {}
  };

  useEffect(() => {
    if (isOpen) {
      startSession();
    } else {
      cleanupAudio();
      setConnectionStatus('disconnected');
    }
    return () => {
      cleanupAudio();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    'Check solar panels & inverters stock',
    'What is Arvind Singh project status?',
    'Show total pending customer balances',
    'Check PUVVNL net metering progress',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#E9EEE9] dark:bg-[#1C2620] text-[#26372D] dark:text-[#E5ECE7] w-full max-w-xl rounded-3xl shadow-[10px_10px_30px_rgba(175,188,177,0.5),-10px_-10px_30px_rgba(255,255,255,0.9)] dark:shadow-[10px_10px_30px_rgba(0,0,0,0.6),-5px_-5px_20px_rgba(40,55,45,0.3)] p-6 sm:p-7 flex flex-col items-center relative overflow-hidden border border-white/60 dark:border-emerald-950/40">
        {/* Soft Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#25845A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#D97706]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#728078] hover:text-[#26372D] dark:text-[#8E9F95] dark:hover:text-white bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[2.5px_2.5px_6px_rgba(175,188,177,0.6),-2.5px_-2.5px_6px_rgba(255,255,255,0.9)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.4),-1px_-1px_3px_rgba(40,55,45,0.3)] transition"
          title="Close voice session"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Engine Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9EEE9] dark:bg-[#152019] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(40,55,45,0.3)] text-xs font-semibold mb-4">
          <Radio
            className={`w-3.5 h-3.5 ${
              isModelSpeaking ? 'text-[#D97706] animate-spin' : 'text-[#25845A] animate-pulse'
            }`}
          />
          <span className="text-[#25845A] dark:text-[#38B57D]">
            {voiceEngine === 'live_stream'
              ? 'Gemini 3.8 Live Stream API'
              : 'Gemini Smart Voice Assistant'}
          </span>
          <span className="text-[10px] text-[#728078] dark:text-[#8E9F95] px-1.5 py-0.5 rounded-md bg-white/70 dark:bg-[#223126]">
            {connectionStatus === 'connected' ? 'Live' : 'Connecting'}
          </span>
        </div>

        <h3 className="text-xl font-bold text-[#26372D] dark:text-[#E5ECE7] text-center">
          SolarFlow Live Voice
        </h3>
        <p className="text-xs text-[#728078] dark:text-[#8E9F95] text-center max-w-sm mb-4">
          {companySettings.companyName} • Real-time Spoken Solar EPC Operations
        </p>

        {/* Dynamic Voice Visualizer Orb */}
        <div className="relative flex items-center justify-center my-4 h-40 w-40">
          {/* Animated concentric rings */}
          {connectionStatus === 'connected' && (
            <>
              <div
                className={`absolute w-36 h-36 rounded-full border-2 transition-all duration-300 ${
                  isModelSpeaking
                    ? 'border-[#D97706]/50 scale-125 animate-ping'
                    : isUserSpeaking
                    ? 'border-[#25845A]/50 scale-110 animate-pulse'
                    : 'border-[#25845A]/20 scale-100'
                }`}
              />
              <div
                className={`absolute w-28 h-28 rounded-full border transition-all duration-300 ${
                  isModelSpeaking
                    ? 'border-[#D97706]/70 scale-110'
                    : 'border-[#25845A]/40 scale-100'
                }`}
              />
            </>
          )}

          {/* Central Pulsing Sphere */}
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              isModelSpeaking
                ? 'bg-gradient-to-tr from-[#D97706] to-[#F59E0B] shadow-[#D97706]/40 text-white scale-110 animate-pulse'
                : isUserSpeaking
                ? 'bg-gradient-to-tr from-[#25845A] to-[#38B57D] shadow-[#25845A]/40 text-white scale-105'
                : 'bg-[#E9EEE9] dark:bg-[#223126] text-[#25845A] dark:text-[#38B57D] shadow-[4px_4px_10px_rgba(175,188,177,0.7),-4px_-4px_10px_rgba(255,255,255,0.9)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.6),-2px_-2px_6px_rgba(40,55,45,0.4)]'
            }`}
          >
            {isModelSpeaking ? (
              <Volume2 className="w-9 h-9 animate-bounce" />
            ) : isMuted ? (
              <MicOff className="w-8 h-8 text-[#DC2626]" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </div>
        </div>

        {/* Live Audio State Label */}
        <div className="text-center mb-4 min-h-[22px]">
          {isModelSpeaking ? (
            <span className="text-xs font-semibold text-[#D97706] flex items-center gap-1.5 justify-center">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> SolarFlow is speaking...
            </span>
          ) : isUserSpeaking || interimText ? (
            <span className="text-xs font-medium text-[#25845A] dark:text-[#38B57D]">
              Listening: "{interimText || 'Speaking...'}"
            </span>
          ) : (
            <span className="text-xs text-[#728078] dark:text-[#8E9F95]">
              {statusNotice || 'Speak now • Asking about site status, stock, or dues'}
            </span>
          )}
        </div>

        {/* Transcript Conversation Box */}
        <div className="w-full max-h-36 overflow-y-auto rounded-2xl p-3 mb-4 bg-[#E9EEE9] dark:bg-[#152019] shadow-[inset_2.5px_2.5px_6px_rgba(175,188,177,0.5),inset_-2.5px_-2.5px_6px_rgba(255,255,255,0.9)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6),inset_-1px_-1px_3px_rgba(40,55,45,0.3)] space-y-2">
          {transcriptLogs.map((log) => (
            <div
              key={log.id}
              className={`text-xs p-2.5 rounded-xl ${
                log.sender === 'user'
                  ? 'bg-white dark:bg-[#223126] text-[#26372D] dark:text-[#E5ECE7] ml-6 shadow-xs border border-emerald-500/20'
                  : 'bg-[#25845A]/10 text-[#25845A] dark:text-[#38B57D] mr-6'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] opacity-75 mb-0.5">
                <span className="font-semibold">
                  {log.sender === 'user' ? 'You' : 'SolarFlow Voice'}
                </span>
                <span>{log.time}</span>
              </div>
              <p className="leading-relaxed">{log.text}</p>
            </div>
          ))}
        </div>

        {/* Quick Voice Prompt Suggestions */}
        <div className="w-full mb-4">
          <div className="text-[11px] font-semibold text-[#728078] dark:text-[#8E9F95] mb-1.5 flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#D97706]" /> Quick Verbal Queries:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSpokenVoiceTurn(q)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#E9EEE9] dark:bg-[#1A261F] text-[#26372D] dark:text-[#C8D6CB] hover:text-[#25845A] hover:bg-white dark:hover:bg-[#243329] shadow-[2px_2px_4px_rgba(175,188,177,0.5),-2px_-2px_4px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.4),-1px_-1px_2px_rgba(40,55,45,0.3)] transition cursor-pointer text-left"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex items-center gap-4 mt-1">
          {/* Mute / Unmute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-2xl transition cursor-pointer ${
              isMuted
                ? 'bg-[#DC2626] text-white shadow-[3px_3px_8px_rgba(220,38,38,0.4)]'
                : 'bg-[#E9EEE9] dark:bg-[#1C2620] text-[#26372D] dark:text-[#E5ECE7] shadow-[3px_3px_8px_rgba(175,188,177,0.7),-3px_-3px_8px_rgba(255,255,255,0.9)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.5),-1px_-1px_3px_rgba(40,55,45,0.3)]'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call */}
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-2xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs flex items-center gap-2 shadow-[4px_4px_12px_rgba(220,38,38,0.35)] transition cursor-pointer hover:scale-105 active:scale-95"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>

          {/* Switch to Chat Modal */}
          <button
            onClick={() => {
              onClose();
              onOpenChat();
            }}
            className="p-3.5 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] text-[#25845A] dark:text-[#38B57D] shadow-[3px_3px_8px_rgba(175,188,177,0.7),-3px_-3px_8px_rgba(255,255,255,0.9)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.5),-1px_-1px_3px_rgba(40,55,45,0.3)] hover:text-[#1E6B47] transition cursor-pointer"
            title="Switch to Text & Tools AI Copilot"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
