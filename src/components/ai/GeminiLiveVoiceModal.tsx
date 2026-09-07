import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Radio,
  Volume2,
  VolumeX,
  Sparkles,
  PhoneOff,
  AlertCircle,
  MessageSquare,
  Headphones,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface GeminiLiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: () => void;
}

export const GeminiLiveVoiceModal: React.FC<GeminiLiveVoiceModalProps> = ({
  isOpen,
  onClose,
  onOpenChat,
}) => {
  const { companySettings } = useApp();

  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected');
  const [isMuted, setIsMuted] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcriptLogs, setTranscriptLogs] = useState<
    { sender: 'user' | 'model'; text: string; time: string }[]
  >([]);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isMutedRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Convert Float32 audio samples to 16-bit Linear PCM Base64
  const floatTo16BitPCMBase64 = (float32Array: Float32Array): string => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
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
      console.error('Audio playback error:', err);
    }
  };

  // Stop scheduled audio immediately (e.g. when interrupted)
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
    setIsModelSpeaking(false);
  };

  // Initialize Live WebSocket and Audio streaming
  const startLiveVoiceSession = async () => {
    try {
      setConnectionStatus('connecting');
      setErrorMessage(null);

      // 1. Request microphone stream
      let stream: MediaStream;
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
        throw new Error(
          `Microphone access was denied or is unavailable: ${micErr.message}. You can still interact with the AI Copilot via Chat.`
        );
      }

      // 2. Connect WebSocket to /live
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
        setTranscriptLogs((prev) => [
          ...prev,
          {
            sender: 'model',
            text: 'Connected to Gemini 3.1 Flash Live API. You can speak now!',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        // Setup audio processing pipeline at 16kHz
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 16000,
        });
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        scriptProcessorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (isMutedRef.current || ws.readyState !== WebSocket.OPEN) return;
          const inputData = e.inputBuffer.getChannelData(0);
          const base64PCM = floatTo16BitPCMBase64(inputData);
          ws.send(JSON.stringify({ audio: base64PCM }));
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            setErrorMessage(data.error);
            return;
          }
          if (data.interrupted) {
            stopAllAudioPlayback();
          }
          if (data.audio) {
            playPCM24kChunk(data.audio);
          }
        } catch (err) {
          console.error('Error handling live message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket Live API error:', err);
        setConnectionStatus('error');
        setErrorMessage('Failed to connect to Live API backend.');
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        cleanupAudio();
      };
    } catch (err: any) {
      console.error('Live session initialization error:', err);
      setConnectionStatus('error');
      setErrorMessage(err.message || 'Unable to establish Live Voice session.');
      cleanupAudio();
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
  };

  useEffect(() => {
    if (isOpen) {
      startLiveVoiceSession();
    } else {
      cleanupAudio();
      setConnectionStatus('disconnected');
    }
    return () => {
      cleanupAudio();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-lg rounded-3xl shadow-2xl p-6 flex flex-col items-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-amber-400 font-semibold mb-6">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Gemini Live API • gemini-3.1-flash-live-preview</span>
        </div>

        <h3 className="text-xl font-bold text-white text-center mb-1">
          SolarFlow Live Voice
        </h3>
        <p className="text-xs text-slate-400 text-center max-w-xs mb-8">
          Real-time, bidirectional voice conversation for {companySettings.companyName}
        </p>

        {/* Dynamic Voice Visualizer Orb */}
        <div className="relative flex items-center justify-center my-6">
          {/* Animated rings */}
          {connectionStatus === 'connected' && (
            <>
              <div
                className={`absolute w-44 h-44 rounded-full border border-amber-500/30 animate-ping duration-1000 ${
                  isModelSpeaking ? 'scale-125 border-red-500/40' : ''
                }`}
              />
              <div
                className={`absolute w-36 h-36 rounded-full bg-amber-500/10 animate-pulse duration-700 ${
                  isModelSpeaking ? 'bg-red-500/20' : ''
                }`}
              />
            </>
          )}

          {/* Central orb */}
          <div
            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-300 relative z-10 ${
              connectionStatus === 'connected'
                ? isModelSpeaking
                  ? 'bg-gradient-to-tr from-amber-600 to-red-600 shadow-red-500/30 ring-4 ring-red-400/40 animate-pulse'
                  : 'bg-gradient-to-tr from-amber-500 to-amber-600 shadow-amber-500/30'
                : connectionStatus === 'connecting'
                ? 'bg-slate-800 ring-2 ring-amber-500/50 animate-pulse'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {connectionStatus === 'connecting' ? (
              <Radio className="w-10 h-10 text-amber-400 animate-spin" />
            ) : isModelSpeaking ? (
              <Volume2 className="w-10 h-10 text-white animate-bounce" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </div>
        </div>

        {/* Real-time Status Caption */}
        <div className="text-center mt-2 mb-6">
          {connectionStatus === 'connecting' && (
            <div className="text-sm font-medium text-amber-400 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Connecting to Live API Session...</span>
            </div>
          )}

          {connectionStatus === 'connected' && (
            <div>
              <div className="text-sm font-semibold text-emerald-400 flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {isModelSpeaking
                    ? 'SolarFlow is speaking...'
                    : isMuted
                    ? 'Microphone muted'
                    : 'Listening... speak freely!'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Say: "What are our pending projects?", "Who has outstanding bills?", "Check PM Surya Ghar status"
              </p>
            </div>
          )}

          {connectionStatus === 'error' && (
            <div className="text-xs text-red-400 bg-red-950/50 border border-red-900 px-4 py-2.5 rounded-xl max-w-sm">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <AlertCircle className="w-4 h-4" />
                <span>Session Connection Issue</span>
              </div>
              <span>{errorMessage || 'Unable to connect to Live API session.'}</span>
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex items-center gap-4 mt-2">
          {/* Mute / Unmute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            disabled={connectionStatus !== 'connected'}
            className={`p-4 rounded-full border transition shadow-sm ${
              isMuted
                ? 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* End Call */}
          <button
            onClick={onClose}
            className="px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition hover:scale-105"
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
            className="p-4 rounded-full bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white transition shadow-sm"
            title="Switch to Text & Tools Chatbot"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>

        {/* Reconnect Option if Disconnected */}
        {connectionStatus === 'disconnected' && (
          <button
            onClick={startLiveVoiceSession}
            className="mt-4 text-xs text-amber-400 hover:underline"
          >
            Click here to reconnect voice session
          </button>
        )}
      </div>
    </div>
  );
};
