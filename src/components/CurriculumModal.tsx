import React from 'react';
import { useApp } from '../context/AppContext';
import { CurriculumType, ExplanationDifficulty, LocalLanguageAid } from '../types';
import { CURRICULA_DATA } from '../data/curriculums';
import { X, Check, BookOpen, Sparkles, Globe, Compass, GraduationCap } from 'lucide-react';

interface CurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurriculumModal: React.FC<CurriculumModalProps> = ({ isOpen, onClose }) => {
  const {
    curriculum,
    setCurriculum,
    grade,
    setGrade,
    subject,
    setSubject,
    topic,
    setTopic,
    difficulty,
    setDifficulty,
    simpleLanguageMode,
    setSimpleLanguageMode,
    localLanguage,
    setLocalLanguage,
  } = useApp();

  if (!isOpen) return null;

  const currentCurriculumMeta = CURRICULA_DATA[curriculum];
  const currentSubjectData = currentCurriculumMeta.subjects.find((s) => s.name === subject) || currentCurriculumMeta.subjects[0];

  const handleCurriculumSelect = (type: CurriculumType) => {
    setCurriculum(type);
  };

  const handleSubjectSelect = (subName: string) => {
    setSubject(subName);
    const subObj = currentCurriculumMeta.subjects.find((s) => s.name === subName);
    if (subObj && subObj.topics.length > 0) {
      setTopic(subObj.topics[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#0F1E36] border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl text-white overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0B192C]">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Curriculum & Study Settings</h2>
              <p className="text-xs text-slate-400">Tailor AI tutoring and exam practice to your exact syllabus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Curriculum Choice */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              1. Choose Examination Board / Curriculum
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['ECZ', 'Cambridge'] as CurriculumType[]).map((cKey) => {
                const meta = CURRICULA_DATA[cKey];
                const isSelected = curriculum === cKey;
                return (
                  <button
                    key={cKey}
                    type="button"
                    onClick={() => handleCurriculumSelect(cKey)}
                    className={`p-4 rounded-xl text-left border transition-all relative ${
                      isSelected
                        ? 'bg-teal-500/15 border-teal-400 ring-1 ring-teal-400/50 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-white">{meta.title}</span>
                          {isSelected && (
                            <span className="p-0.5 rounded-full bg-teal-500 text-slate-950">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-teal-300 font-medium mt-0.5">{meta.fullName}</p>
                        <p className="text-[11px] text-slate-400 mt-2">{meta.region}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Grade / Level */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              2. Select Grade or Qualification Level
            </label>
            <div className="flex flex-wrap gap-2">
              {currentCurriculumMeta.grades.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors border ${
                    grade === g
                      ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-xs'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Subject Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              3. Subject & Paper Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {currentCurriculumMeta.subjects.map((sub) => {
                const isSelected = subject === sub.name;
                return (
                  <button
                    key={sub.name}
                    type="button"
                    onClick={() => handleSubjectSelect(sub.name)}
                    className={`p-3 rounded-xl text-left border transition-colors ${
                      isSelected
                        ? 'bg-teal-500/15 border-teal-400 text-white ring-1 ring-teal-400/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold text-xs sm:text-sm">{sub.name}</div>
                    {sub.code && <div className="text-[10px] text-teal-300 font-mono mt-0.5">{sub.code}</div>}
                  </button>
                );
              })}
            </div>
            {currentSubjectData && (
              <div className="mt-2 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 text-[11px] text-slate-300">
                <span className="font-semibold text-teal-300">Exam Papers:</span> {currentSubjectData.papersDescription}
              </div>
            )}
          </div>

          {/* 4. Active Topic */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              4. Active Syllabus Topic
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-900/80 rounded-xl border border-slate-800">
              {currentSubjectData.topics.map((top) => (
                <button
                  key={top}
                  type="button"
                  onClick={() => setTopic(top)}
                  className={`px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    topic === top
                      ? 'bg-teal-500 text-slate-950 font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {top}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Pedagogical Level & Simple Language Modes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            {/* Explanation Difficulty */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Explanation Depth
              </label>
              <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800">
                {(
                  [
                    { key: 'simple', label: 'Simple (Analogies)' },
                    { key: 'standard', label: 'Standard (Exam)' },
                    { key: 'advanced', label: 'Distinction / A*' },
                  ] as { key: ExplanationDifficulty; label: string }[]
                ).map((tier) => (
                  <button
                    key={tier.key}
                    type="button"
                    onClick={() => setDifficulty(tier.key)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      difficulty === tier.key
                        ? 'bg-teal-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Simple Language Mode & Local Language Aid */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Language & Comprehension Aid
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                  <input
                    type="checkbox"
                    checked={simpleLanguageMode}
                    onChange={(e) => setSimpleLanguageMode(e.target.checked)}
                    className="rounded border-slate-700 text-teal-500 focus:ring-teal-400"
                  />
                  <span>
                    <strong>Simple Language Mode:</strong> Plain words & vocabulary glossaries.
                  </span>
                </label>

                {curriculum === 'ECZ' && (
                  <div className="flex items-center gap-2 text-xs">
                    <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="text-slate-400">Local language aid:</span>
                    <select
                      value={localLanguage}
                      onChange={(e) => setLocalLanguage(e.target.value as LocalLanguageAid)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-400"
                    >
                      <option value="none">English Only</option>
                      <option value="bemba">Bemba Comprehension Aid</option>
                      <option value="nyanja">Nyanja/Chewa Comprehension Aid</option>
                      <option value="tonga">Tonga Comprehension Aid</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0B192C] flex items-center justify-between">
          <p className="text-[11px] text-slate-400 max-w-md">
            Changes apply instantly across all AI Tutor lessons, Exam Practice, and Flashcards.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-teal-500/20"
          >
            Apply & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
