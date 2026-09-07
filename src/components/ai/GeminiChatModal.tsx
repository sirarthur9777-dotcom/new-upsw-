import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Mic,
  MicOff,
  Radio,
  Cpu,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatMessage, ChatToolCall, ChatAction } from '../../types';

interface GeminiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLiveVoice: () => void;
}

export const GeminiChatModal: React.FC<GeminiChatModalProps> = ({
  isOpen,
  onClose,
  onOpenLiveVoice,
}) => {
  const {
    getErpStateSnapshot,
    applyChatAction,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('upsw_gemini_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return [
      {
        id: 'welcome-01',
        role: 'assistant',
        content: `Namaste! I am your **SolarFlow AI Copilot** for Upadhyay Brother Solar Works.

I have direct access to our live ERP database and can answer queries or execute operations for:
- 📊 **Customers & Leads**: Search, customer profiles, proposals & follow-ups
- ☀️ **Solar Projects**: Capacities (kW), site progress, and assigned engineers
- 📅 **Installations**: Site scheduling and technician assignments
- 📦 **Inventory**: Real-time stock levels and low stock warnings
- 💰 **Billing & Dues**: Invoices, pending balances, and recording cash/UPI payments
- 🏛️ **Subsidies & Grid**: PM Surya Ghar Muft Bijli Yojana & PUVVNL net metering
- 🛠️ **Service Tickets**: Troubleshooting, plant maintenance, and inverter faults

How may I assist you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.5-flash',
      },
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash');
  const [rolePersona, setRolePersona] = useState<string>('erp_assistant');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedToolCalls, setExpandedToolCalls] = useState<Record<string, boolean>>({});
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem('upsw_gemini_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Web Speech API for voice dictation
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. You can type your question or use the Live Voice Assistant.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Mic start error:', err);
        setIsListening(false);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputPrompt('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const erpState = getErpStateSnapshot();

      // Send to server-side Gemini API
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel,
          rolePersona,
          erpState,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.text || 'Failed to connect to Gemini API');
      }

      // Execute actions returned by tool calling
      if (data.actions && Array.isArray(data.actions)) {
        for (const act of data.actions) {
          await applyChatAction(act);
        }
      }

      const assistantMessage: ChatMessage = {
        id: `assist-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'Action completed successfully.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls: data.toolCalls || [],
        actions: data.actions || [],
        modelUsed: data.model || selectedModel,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Error executing request.');
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Connection Issue**: ${err.message || 'Unable to complete request. Please verify GEMINI_API_KEY or try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = () => {
    localStorage.removeItem('upsw_gemini_chat_history');
    setMessages([
      {
        id: 'welcome-fresh',
        role: 'assistant',
        content: `Chat history cleared. How may I assist you with your solar operations?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      },
    ]);
  };

  const samplePrompts = [
    'Show pending customer payments and dues',
    'Which solar projects are currently running?',
    'What is our current inventory of inverters and solar panels?',
    'Check PM Surya Ghar subsidy application status',
    'Check net metering grid synchronization status',
    'Show pending customer follow-ups and leads',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl h-[90vh] max-h-[860px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  SolarFlow AI Copilot
                </h2>
                <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live ERP Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                22 ERP Tools Active • Multi-turn Reasoning • State Mutation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Voice API Button */}
            <button
              onClick={() => {
                onClose();
                onOpenLiveVoice();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-semibold shadow-xs transition hover:scale-102"
              title="Launch Real-time Voice with gemini-3.1-flash-live-preview"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Live Voice (Live API)</span>
            </button>

            {/* Clear History */}
            <button
              onClick={clearChatHistory}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title="Clear Conversation History"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-bar: Model Selection & Role Switcher */}
        <div className="px-5 py-2.5 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Role Persona */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Assistant Role:</span>
            <select
              value={rolePersona}
              onChange={(e) => setRolePersona(e.target.value)}
              className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden font-medium"
            >
              <option value="erp_assistant">Operational Copilot (General ERP)</option>
              <option value="project_manager">Site Project Manager (EPC Projects & Tech)</option>
              <option value="finance_officer">Finance & Accounts Officer (Billing & Ledgers)</option>
              <option value="service_technician">Support Engineer (Net Metering & Subsidy)</option>
            </select>
          </div>

          {/* Model Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" />
              Model:
            </span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden font-medium"
            >
              <option value="gemini-3.5-flash">gemini-3.5-flash (General Tasks - Recommended)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Reasoning)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra-Fast)</option>
            </select>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2 max-w-full">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/80 dark:border-slate-700/80'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>

                  {/* Tool Calls Accordion */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {msg.toolCalls.map((tool, idx) => {
                        const key = `${msg.id}-tool-${idx}`;
                        const isExpanded = expandedToolCalls[key];
                        return (
                          <div
                            key={key}
                            className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 text-xs"
                          >
                            <button
                              onClick={() =>
                                setExpandedToolCalls((prev) => ({
                                  ...prev,
                                  [key]: !prev[key],
                                }))
                              }
                              className="w-full flex items-center justify-between text-left font-mono font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 transition"
                            >
                              <span className="flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                                <span>Tool Call: {tool.name}()</span>
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>

                            {isExpanded && (
                              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-1.5 overflow-x-auto text-slate-600 dark:text-slate-300">
                                {tool.args && Object.keys(tool.args).length > 0 && (
                                  <div>
                                    <span className="text-slate-400">Args:</span>{' '}
                                    {JSON.stringify(tool.args)}
                                  </div>
                                )}
                                {tool.result && (
                                  <div>
                                    <span className="text-slate-400">Result:</span>{' '}
                                    <pre className="max-h-36 overflow-y-auto bg-white dark:bg-slate-950 p-2 rounded-md border border-slate-200 dark:border-slate-800 text-[11px]">
                                      {JSON.stringify(tool.result, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Executed Actions Badges */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {msg.actions.map((act, aIdx) => (
                        <span
                          key={aIdx}
                          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{act.summary}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Metadata line */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {msg.timestamp}
                    </span>
                    {msg.modelUsed && (
                      <span className="px-1.5 py-0.2 rounded-sm bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {msg.modelUsed}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl px-4 py-2.5 text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
                <span className="font-medium">
                  {selectedModel === 'gemini-3.1-pro-preview'
                    ? 'Pro Reasoning & Calling ERP Tools...'
                    : 'Executing Tool Calling & Synthesizing Response...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-5 py-2 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl border transition ${
                isListening
                  ? 'bg-red-500 text-white border-red-600 animate-pulse shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-amber-500'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Click to dictate prompt via Voice'}
            >
              {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={
                isListening
                  ? 'Listening to speech...'
                  : 'Ask about solar projects, record payments, check subsidies, or type a request...'
              }
              className="flex-1 bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-xs transition"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
