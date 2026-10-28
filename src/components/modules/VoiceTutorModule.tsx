import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { requestApi } from '../../services/api';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Edit3,
} from 'lucide-react';

export const VoiceTutorModule: React.FC = () => {
  const { curriculum, grade, subject, topic, difficulty, simpleLanguageMode, localLanguage, profile } = useApp();

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [editableTranscript, setEditableTranscript] = useState('');
  const [responseAudioText, setResponseAudioText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Recognition ref
  const recognitionRef = useRef<any>(null);

  // Check Web Speech API availability
  const isSpeechSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startVoiceInput = () => {
    setError(null);
    if (!isSpeechSupported) {
      setError('Web Speech API is not supported in this browser. You can type your question in the text box below.');
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setTranscript('');
        setEditableTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
        setEditableTranscript(currentText);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone permission was denied. Please allow microphone access in your browser settings to use voice input.');
        } else {
          setError(`Voice input issue (${event.error}). You can edit your question or type below.`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setError('Could not access microphone. Please ensure microphone permissions are granted.');
      setIsRecording(false);
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleAskTutor = async () => {
    const query = editableTranscript.trim();
    if (!query || loading) return;

    setLoading(true);
    setError(null);
    setResponseAudioText(null);

    try {
      const res = await requestApi<{ reply: string }>(
        '/api/tutor',
        {
          message: query,
          curriculum,
          grade,
          subject,
          topic,
          difficulty,
          simpleLanguageMode,
          localLanguage,
        },
        { isPremium: profile.planTier === 'premium' }
      );

      setResponseAudioText(res.data.reply);
      // Automatically speak response
      speakResponse(res.data.reply);
    } catch (err: any) {
      console.error('Voice tutor request failed:', err);
      setError(err.message || 'Failed to get tutor answer.');
    } finally {
      setLoading(false);
    }
  };

  const speakResponse = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const clean = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/###/g, '')
      .replace(/`/g, '');

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#0B192C] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
              <Mic className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-white">Interactive Voice Tutor</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Speak your question aloud for hands-free audio revision and spoken explanations.
          </p>
        </div>

        <div className="text-[11px] font-mono text-teal-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          Microphone active only when recording button is pressed
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs font-bold text-rose-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Voice Interactive Card */}
      <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-[#0F1E36] border border-slate-800 text-center space-y-6 shadow-2xl">
        <div className="flex items-center justify-center">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording
                ? 'bg-rose-500/20 text-rose-400 ring-8 ring-rose-500/20 scale-110 animate-pulse'
                : 'bg-teal-500/20 text-teal-400'
            }`}
          >
            {isRecording ? <Mic className="w-10 h-10" /> : <MicOff className="w-10 h-10" />}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            {isRecording ? 'Listening... Speak clearly' : 'Tap below to speak your question'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Topic: <span className="text-teal-300 font-semibold">{topic}</span> ({curriculum} {grade})
          </p>
        </div>

        {/* Voice Trigger Buttons */}
        <div className="flex items-center justify-center gap-3">
          {!isRecording ? (
            <button
              onClick={startVoiceInput}
              className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              <span>Start Speaking</span>
            </button>
          ) : (
            <button
              onClick={stopVoiceInput}
              className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Stop Recording</span>
            </button>
          )}
        </div>

        {/* Editable Transcript Area */}
        <div className="space-y-2 text-left">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-teal-400" /> Review & Edit Your Spoken Question:
            </span>
            {editableTranscript && (
              <button
                onClick={() => setEditableTranscript('')}
                className="text-[11px] text-slate-500 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            rows={3}
            value={editableTranscript}
            onChange={(e) => setEditableTranscript(e.target.value)}
            placeholder="Your transcribed question will appear here. You can also type directly..."
            className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 font-sans"
          />

          <button
            onClick={handleAskTutor}
            disabled={loading || !editableTranscript.trim()}
            className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-md shadow-teal-500/20"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Formulating Spoken Tutor Response...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Send to AI Voice Tutor</span>
              </>
            )}
          </button>
        </div>

        {/* Spoken Response Audio Card */}
        {responseAudioText && (
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-700 text-left space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-xs text-white">Tutor Spoken Explanation</span>
              </div>
              <button
                onClick={isPlaying ? stopSpeaking : () => speakResponse(responseAudioText)}
                className="px-3 py-1 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {isPlaying ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-amber-400" /> Stop Audio
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Replay Audio
                  </>
                )}
              </button>
            </div>

            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {responseAudioText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
