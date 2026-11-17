import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { requestApi } from '../../services/api';
import {
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  GraduationCap,
  AlertCircle,
  Lightbulb,
  Globe,
  Zap,
  Brain,
  ExternalLink,
} from 'lucide-react';

type TutorRole = 'examiner' | 'fast_coach' | 'deep_reasoner' | 'web_researcher';

interface GroundingSource {
  title: string;
  uri: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  roleUsed?: TutorRole;
  groundingSources?: GroundingSource[];
}

const TUTOR_STORAGE_KEY = 'scholarspark_tutor_history_v1';

const ROLE_OPTIONS: Array<{
  id: TutorRole;
  label: string;
  hint: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { id: 'examiner', label: 'Syllabus Tutor', hint: 'Balanced exam steps & mark schemes', icon: GraduationCap },
  { id: 'fast_coach', label: 'Fast Coach', hint: 'Rapid summaries & quick formulas', icon: Zap },
  { id: 'deep_reasoner', label: 'Deep Solver', hint: 'Detailed multi-step reasoning & proofs', icon: Brain },
  { id: 'web_researcher', label: 'Web Research', hint: 'Live Google Search grounding & citations', icon: Globe },
];

// Safe JSX inline formatting for bold (**text**) and inline code (`code`) without raw HTML injection
function renderInlineFormatted(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-950 text-teal-300 font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function FormattedTutorText({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  const lines = content.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={i} className="h-1.5" />;
        }
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={i} className="border-slate-800 my-2" />;
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={i} className="text-sm font-bold text-teal-300 pt-1.5">
              {renderInlineFormatted(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={i} className="text-sm sm:text-base font-extrabold text-white pt-2">
              {renderInlineFormatted(trimmed.slice(3))}
            </h3>
          );
        }
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <div key={i} className="flex items-start gap-2 pl-2">
              <span className="text-teal-400 font-bold mt-0.5">•</span>
              <span className="flex-1">{renderInlineFormatted(trimmed.slice(2))}</span>
            </div>
          );
        }
        return <p key={i}>{renderInlineFormatted(line)}</p>;
      })}
    </div>
  );
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
    quotaLimit,
  } = useApp();

  const buildWelcomeMessage = (): ChatMessage => ({
    id: 'welcome',
    role: 'assistant',
    content: `Hello ${profile.name}! I am your **ScholarSpark AI Tutor**, calibrated for **${curriculum} (${grade})** in **${subject}**.\n\nWe are currently set to explore **${topic}**.\n\nChoose a chatbot role above—**Syllabus Tutor**, **Fast Coach**, **Deep Solver**, or **Web Research** (with live Google Search citations)—and ask any question!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(TUTOR_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore malformed storage
    }
    return [buildWelcomeMessage()];
  });

  const [tutorRole, setTutorRole] = useState<TutorRole>('examiner');
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Keep welcome message synced if user switches curriculum/subject/topic before chatting
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [buildWelcomeMessage()];
      }
      return prev;
    });
  }, [curriculum, grade, subject, topic, profile.name]);

  // Persist multi-turn thread locally so navigation preserves study context
  useEffect(() => {
    try {
      localStorage.setItem(TUTOR_STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      // Ignore quota errors
    }
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleResetChat = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    const fresh = [buildWelcomeMessage()];
    setMessages(fresh);
    try {
      localStorage.removeItem(TUTOR_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setError(null);
    setLastFailedPrompt(null);
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText ?? input).trim();
    if (!textToSend || loading) return;

    setError(null);
    setLastFailedPrompt(null);

    const isRetrySamePrompt =
      messages.length > 0 &&
      messages[messages.length - 1].role === 'user' &&
      messages[messages.length - 1].content === textToSend;

    const historyPayload = messages
      .filter((m) => m.id !== 'welcome' && !(isRetrySamePrompt && m.id === messages[messages.length - 1].id))
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    if (!isRetrySamePrompt) {
      const userMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'user',
        content: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, userMsg]);
    }

    if (!messageText) setInput('');
    setLoading(true);

    try {
      const res = await requestApi<{
        reply: string;
        roleUsed?: TutorRole;
        groundingSources?: GroundingSource[];
      }>('/api/tutor', {
        message: textToSend,
        curriculum,
        grade,
        subject,
        topic,
        difficulty,
        simpleLanguageMode,
        localLanguage,
        tutorRole,
        useSearchGrounding: useSearchGrounding || tutorRole === 'web_researcher',
        history: historyPayload,
      });

      if (res.quotaRemaining !== undefined) {
        setQuotaInfo(res.quotaRemaining, res.quotaLimit ?? quotaLimit);
      }

      const assistantMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleUsed: res.data.roleUsed || tutorRole,
        groundingSources: Array.isArray(res.data.groundingSources) ? res.data.groundingSources : [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Tutor error:', err);
      setError(err.message || 'Failed to reach AI Tutor. Please try again.');
      setLastFailedPrompt(textToSend);
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
    `Explain the key formulas and concepts required for ${topic}.`,
    `What are the most common mistakes students make in ${topic}?`,
    `Search for latest ${curriculum} ${subject} exam updates or real-world examples for ${topic}.`,
  ];

  const activeRoleMeta = ROLE_OPTIONS.find((r) => r.id === tutorRole) || ROLE_OPTIONS[0];

  return (
    <div className="h-[calc(100dvh-10.5rem)] lg:h-[calc(100vh-8.5rem)] flex flex-col bg-[#0F1E36] rounded-xl border border-slate-800 overflow-hidden">
      {/* Tutor Header Controls */}
      <div className="p-3 sm:p-4 bg-[#0B192C] border-b border-slate-800 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-sm text-white">AI Tutor Chatbot</h2>
                  <span className="text-[10px] bg-slate-800 text-teal-300 px-2 py-0.5 rounded font-mono truncate">
                    {curriculum} · {subject}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">Topic: {topic}</p>
              </div>
            </div>

            <button
              onClick={handleResetChat}
              className="sm:hidden p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              title="New conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Depth, Simple Mode, Search Grounding & Reset Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs">
              {(['simple', 'standard', 'advanced'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setDifficulty(tier)}
                  className={`px-2 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                    difficulty === tier
                      ? 'bg-teal-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSimpleLanguageMode(!simpleLanguageMode)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                simpleLanguageMode
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Toggle simpler vocabulary and short sentences"
            >
              {simpleLanguageMode ? 'Simple: ON' : 'Simple: OFF'}
            </button>

            <button
              onClick={() => setUseSearchGrounding((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors flex items-center gap-1 ${
                useSearchGrounding || tutorRole === 'web_researcher'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Ground answers with live Google Search web sources"
            >
              <Globe className="w-3 h-3" />
              <span>{useSearchGrounding || tutorRole === 'web_researcher' ? 'Web Search: ON' : 'Web Search: OFF'}</span>
            </button>

            <button
              onClick={handleResetChat}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors"
              title="Start a fresh conversation"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Chatbot Role Selector Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {ROLE_OPTIONS.map((role) => {
            const Icon = role.icon;
            const active = tutorRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setTutorRole(role.id)}
                title={role.hint}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 whitespace-nowrap border transition-colors ${
                  active
                    ? 'bg-teal-500/15 border-teal-500/50 text-teal-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span>{role.label}</span>
              </button>
            );
          })}
          <span className="hidden md:inline text-[11px] text-slate-500 pl-2 truncate">
            {activeRoleMeta.hint}
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          const msgRoleLabel = ROLE_OPTIONS.find((r) => r.id === m.roleUsed)?.label || 'ScholarSpark Tutor';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[82%] rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-xs'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-xs'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[11px] text-teal-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" /> {msgRoleLabel}
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

                <FormattedTutorText content={m.content} isUser={isUser} />

                {!isUser && m.groundingSources && m.groundingSources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Web Sources (Google Search)
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.groundingSources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-[11px] text-sky-300 hover:text-sky-200 transition-colors max-w-full truncate"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[220px]">{src.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

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
              <span>
                {useSearchGrounding || tutorRole === 'web_researcher'
                  ? 'Searching live web sources & formulating grounded response...'
                  : `Analyzing ${curriculum} syllabus as ${activeRoleMeta.label}...`}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            {lastFailedPrompt && (
              <button
                onClick={() => handleSend(lastFailedPrompt)}
                className="px-2.5 py-1 bg-rose-900/80 hover:bg-rose-800 rounded text-xs font-semibold text-white transition-colors shrink-0"
              >
                Retry
              </button>
            )}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      {messages.length <= 2 && (
        <div className="px-3 sm:px-4 py-2 bg-slate-900/60 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] text-slate-400 shrink-0">Try:</span>
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
            placeholder={`Ask ${activeRoleMeta.label} about ${topic}...`}
            disabled={loading}
            className="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask Tutor</span>
          </button>
        </form>
      </div>
    </div>
  );
};
