import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { requestApi } from '../../services/api';
import {
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  BookOpen,
  HelpCircle,
  RotateCcw,
  GraduationCap,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AITutorModule: React.FC = () => {
  const {
    curriculum,
    grade,
    subject,
    topic,
    difficulty,
    setDifficulty,
    simpleLanguageMode,
    setSimpleLanguageMode,
    localLanguage,
    profile,
    setQuotaInfo,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${profile.name}! I am your **ScholarSpark AI Tutor**, calibrated for **${curriculum} (${grade})** in **${subject}**.\n\nWe are currently set to explore **"${topic}"**.\n\nHow can I help you understand this topic today? You can ask me to solve an exam calculation step-by-step, explain a concept with everyday analogies, or test your recall!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await requestApi<{ reply: string }>(
        '/api/tutor',
        {
          message: textToSend.trim(),
          curriculum,
          grade,
          subject,
          topic,
          difficulty,
          simpleLanguageMode,
          localLanguage,
          history: historyPayload,
        },
        { isPremium: profile.planTier === 'premium' }
      );

      if (res.quotaRemaining !== undefined) {
        setQuotaInfo(res.quotaRemaining, 25);
      }

      const assistantMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Tutor error:', err);
      setError(err.message || 'Failed to reach AI Tutor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean markdown before speaking
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/###/g, '')
      .replace(/`/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const suggestedPrompts = [
    `Break down a typical ${curriculum} exam question on ${topic} step-by-step.`,
    `Explain the key formulas and units required for ${topic}.`,
    `What are the most common mistakes students make in ${topic} exams?`,
    `Give me a practice question on ${topic} to test my understanding.`,
  ];

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col bg-[#0F1E36] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Tutor Header Controls */}
      <div className="p-4 bg-[#0B192C] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-white">AI Tutor Session</h2>
              <span className="text-[10px] bg-slate-800 text-teal-300 px-2 py-0.5 rounded font-mono">
                {curriculum} · {subject}
              </span>
            </div>
            <p className="text-xs text-slate-400">Active Topic: {topic}</p>
          </div>
        </div>

        {/* Depth & Language Controls */}
        <div className="flex items-center gap-2">
          {/* Depth Selector */}
          <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs">
            {(['simple', 'standard', 'advanced'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setDifficulty(tier)}
                className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${
                  difficulty === tier
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          {/* Simple Language Toggle */}
          <button
            onClick={() => setSimpleLanguageMode(!simpleLanguageMode)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              simpleLanguageMode
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Toggle simple vocabulary and explanations"
          >
            {simpleLanguageMode ? 'Simple Mode: ON' : 'Simple Mode: OFF'}
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-xs'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-xs shadow-md'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[11px] text-teal-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" /> ScholarSpark Tutor
                    </span>
                    <button
                      onClick={() => handleSpeak(m.content)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-teal-300 transition-colors"
                      title={isSpeaking ? 'Stop speaking' : 'Read explanation aloud'}
                    >
                      {isSpeaking ? (
                        <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{m.content}</div>
                <div
                  className={`text-[10px] mt-2 ${
                    isUser ? 'text-slate-800/80 text-right' : 'text-slate-500 text-right'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-xs p-4 flex items-center gap-3 text-xs text-slate-300">
              <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing syllabus objectives & formulating worked solution...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => handleSend()}
              className="px-2.5 py-1 bg-rose-900/80 hover:bg-rose-800 rounded text-xs font-semibold text-white transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] text-slate-400 shrink-0">Try asking:</span>
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 whitespace-nowrap border border-slate-700/80 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 sm:p-4 bg-[#0B192C] border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask a question about ${topic}... (e.g. "How do I calculate this?")`}
            disabled={loading}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md shadow-teal-500/20"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask Tutor</span>
          </button>
        </form>
      </div>
    </div>
  );
};
