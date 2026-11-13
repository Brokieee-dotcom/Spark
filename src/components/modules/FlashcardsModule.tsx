import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FlashcardDeck, Flashcard } from '../../types';
import { requestApi } from '../../services/api';
import {
  Layers,
  Plus,
  RotateCw,
  CheckCircle2,
  Shuffle,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Check,
} from 'lucide-react';

export const FlashcardsModule: React.FC = () => {
  const {
    flashcardDecks,
    saveDeck,
    deleteDeck,
    updateCardStatus,
    curriculum,
    subject,
    topic,
    profile,
    setQuotaInfo,
  } = useApp();

  const [activeDeckId, setActiveDeckId] = useState<string>(
    flashcardDecks[0]?.id || ''
  );
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterMissedOnly, setFilterMissedOnly] = useState(false);
  const [confirmDeleteDeckId, setConfirmDeleteDeckId] = useState<string | null>(null);

  // AI Generator modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genSubject, setGenSubject] = useState(subject);
  const [genTopic, setGenTopic] = useState(topic);
  const [genNotes, setGenNotes] = useState('');
  const [genCount, setGenCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Manual Card / Custom Deck modal state
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [cardTip, setCardTip] = useState('');
  const [cardDifficulty, setCardDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  useEffect(() => {
    setGenSubject(subject);
    setGenTopic(topic);
  }, [subject, topic]);

  const activeDeck = flashcardDecks.find((d) => d.id === activeDeckId) || flashcardDecks[0];

  useEffect(() => {
    if (activeDeck && activeDeck.id !== activeDeckId) {
      setActiveDeckId(activeDeck.id);
    }
  }, [activeDeck, activeDeckId]);

  const cardsToReview = activeDeck
    ? filterMissedOnly
      ? activeDeck.cards.filter((c) => c.status === 'needs_practice')
      : activeDeck.cards
    : [];

  const safeIndex =
    cardsToReview.length > 0 ? Math.min(currentCardIndex, cardsToReview.length - 1) : 0;
  const currentCard: Flashcard | undefined = cardsToReview[safeIndex];

  const knownCount = activeDeck ? activeDeck.cards.filter((c) => c.status === 'known').length : 0;
  const missedCount = activeDeck ? activeDeck.cards.filter((c) => c.status === 'needs_practice').length : 0;
  const totalCards = activeDeck ? activeDeck.cards.length : 0;

  const handlePrevCard = () => {
    if (cardsToReview.length <= 1) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + cardsToReview.length) % cardsToReview.length);
  };

  const handleNextCard = () => {
    if (cardsToReview.length <= 1) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % cardsToReview.length);
  };

  const handleRate = (status: 'known' | 'needs_practice') => {
    if (!activeDeck || !currentCard) return;
    updateCardStatus(activeDeck.id, currentCard.id, status);

    setIsFlipped(false);
    if (safeIndex + 1 < cardsToReview.length) {
      setCurrentCardIndex(safeIndex + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handleShuffle = () => {
    if (!activeDeck) return;
    const shuffled = [...activeDeck.cards].sort(() => Math.random() - 0.5);
    saveDeck({ ...activeDeck, cards: shuffled });
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleOpenAddCard = () => {
    setEditingCardId(null);
    setCardFront('');
    setCardBack('');
    setCardTip('');
    setCardDifficulty('medium');
    setShowCardModal(true);
  };

  const handleOpenEditCard = () => {
    if (!currentCard) return;
    setEditingCardId(currentCard.id);
    setCardFront(currentCard.front);
    setCardBack(currentCard.back);
    setCardTip(currentCard.tip || '');
    setCardDifficulty(currentCard.difficulty || 'medium');
    setShowCardModal(true);
  };

  const handleSaveManualCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFront.trim() || !cardBack.trim()) return;

    if (!activeDeck) {
      const newDeck: FlashcardDeck = {
        id: `deck-manual-${Date.now()}`,
        title: `${curriculum} ${subject}: Custom Deck`,
        curriculum,
        subject,
        topic,
        cards: [
          {
            id: `card-${Date.now()}`,
            front: cardFront.trim(),
            back: cardBack.trim(),
            tip: cardTip.trim() || undefined,
            difficulty: cardDifficulty,
            status: 'unreviewed',
          },
        ],
        createdAt: new Date().toISOString(),
        isCustom: true,
      };
      saveDeck(newDeck);
      setActiveDeckId(newDeck.id);
      setCurrentCardIndex(0);
    } else if (editingCardId) {
      const updatedCards = activeDeck.cards.map((c) =>
        c.id === editingCardId
          ? {
              ...c,
              front: cardFront.trim(),
              back: cardBack.trim(),
              tip: cardTip.trim() || undefined,
              difficulty: cardDifficulty,
            }
          : c
      );
      saveDeck({ ...activeDeck, cards: updatedCards });
    } else {
      const newCard: Flashcard = {
        id: `card-${Date.now()}`,
        front: cardFront.trim(),
        back: cardBack.trim(),
        tip: cardTip.trim() || undefined,
        difficulty: cardDifficulty,
        status: 'unreviewed',
      };
      const updatedCards = [...activeDeck.cards, newCard];
      saveDeck({ ...activeDeck, cards: updatedCards });
      setFilterMissedOnly(false);
      setCurrentCardIndex(updatedCards.length - 1);
      setIsFlipped(false);
    }

    setShowCardModal(false);
  };

  const handleDeleteActiveDeck = () => {
    if (!activeDeck) return;
    const remaining = flashcardDecks.filter((d) => d.id !== activeDeck.id);
    deleteDeck(activeDeck.id);
    setConfirmDeleteDeckId(null);
    setActiveDeckId(remaining[0]?.id || '');
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setFilterMissedOnly(false);
  };

  const handleGenerateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTopic.trim()) return;

    setGenerating(true);
    setGenError(null);
    try {
      const res = await requestApi<{ cards: Flashcard[] }>(
        '/api/flashcards/generate',
        {
          curriculum,
          subject: genSubject,
          topic: genTopic,
          notes: genNotes,
          count: genCount,
        },
        { isPremium: profile.planTier === 'premium' }
      );

      if (res.quotaRemaining !== undefined) {
        setQuotaInfo(res.quotaRemaining, res.quotaLimit ?? 50);
      }

      const newDeck: FlashcardDeck = {
        id: 'deck-' + Date.now(),
        title: `${curriculum} ${genSubject}: ${genTopic}`,
        curriculum,
        subject: genSubject,
        topic: genTopic,
        cards: res.data.cards.map((c, i) => ({
          ...c,
          id: `card-${Date.now()}-${i}`,
          status: 'unreviewed',
        })),
        createdAt: new Date().toISOString(),
        isCustom: true,
      };

      saveDeck(newDeck);
      setActiveDeckId(newDeck.id);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setFilterMissedOnly(false);
      setShowGenerateModal(false);
      setGenNotes('');
    } catch (err: any) {
      console.error('Deck generation error:', err);
      setGenError(err.message || 'Failed to generate flashcards.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#0B192C] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-white">Smart Revision Flashcards</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Active recall & spaced repetition tailored to your {curriculum} syllabus.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleOpenAddCard}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-teal-400" />
            <span>Add Card</span>
          </button>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-teal-500/20 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Deck with AI</span>
          </button>
        </div>
      </div>

      {/* Deck Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        {flashcardDecks.map((deck) => {
          const isSelected = deck.id === activeDeck?.id;
          return (
            <button
              key={deck.id}
              onClick={() => {
                setActiveDeckId(deck.id);
                setCurrentCardIndex(0);
                setIsFlipped(false);
                setFilterMissedOnly(false);
                setConfirmDeleteDeckId(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                isSelected
                  ? 'bg-teal-500/15 border-teal-400 text-teal-300 ring-1 ring-teal-400/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {deck.title} ({deck.cards.length})
            </button>
          );
        })}
      </div>

      {activeDeck && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Flashcard Interactive Area (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 px-1">
              <div className="font-mono">
                Card {cardsToReview.length > 0 ? safeIndex + 1 : 0} of {cardsToReview.length}
                {filterMissedOnly && (
                  <span className="text-amber-400 ml-2 font-bold">[Missed Cards Mode]</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {currentCard && (
                  <button
                    onClick={handleOpenEditCard}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-800 flex items-center gap-1"
                    title="Edit current card"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Edit</span>
                  </button>
                )}

                <button
                  onClick={handleShuffle}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-800 flex items-center gap-1"
                  title="Shuffle deck"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Shuffle</span>
                </button>

                {missedCount > 0 && (
                  <button
                    onClick={() => {
                      setFilterMissedOnly(!filterMissedOnly);
                      setCurrentCardIndex(0);
                      setIsFlipped(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                      filterMissedOnly
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Review {missedCount} Missed
                  </button>
                )}
              </div>
            </div>

            {/* 3D Flip Card Container */}
            {currentCard ? (
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer min-h-[280px] sm:min-h-[340px] rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-2xl relative border bg-gradient-to-br from-slate-900 via-[#0F1E36] to-slate-900 border-slate-700/80 hover:border-teal-500/50"
              >
                {/* Card Top Label */}
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
                    {isFlipped ? 'ANSWER / MARK SCHEME' : 'QUESTION / PROMPT'}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <RotateCw className="w-3 h-3" /> Tap card to flip
                  </span>
                </div>

                {/* Card Center Content */}
                <div className="my-auto py-6 text-center">
                  <div
                    className={`text-base sm:text-xl font-bold leading-relaxed whitespace-pre-wrap ${
                      isFlipped ? 'text-teal-200' : 'text-white'
                    }`}
                  >
                    {isFlipped ? currentCard.back : currentCard.front}
                  </div>

                  {isFlipped && currentCard.tip && (
                    <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200/90 text-left max-w-md mx-auto">
                      <span className="font-bold text-amber-400">Exam Tip: </span>
                      {currentCard.tip}
                    </div>
                  )}
                </div>

                {/* Card Bottom status indicator */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-4 border-t border-slate-800/80">
                  <span>Difficulty: {currentCard.difficulty || 'standard'}</span>
                  <span>
                    Status:{' '}
                    <strong className="text-slate-300 font-mono">
                      {currentCard.status || 'unreviewed'}
                    </strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="min-h-[280px] rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-teal-400 mb-2" />
                <h3 className="font-bold text-white text-sm">All selected cards reviewed!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  You have reviewed all cards in this view.
                </p>
                <button
                  onClick={() => {
                    setFilterMissedOnly(false);
                    setCurrentCardIndex(0);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs"
                >
                  Reset & Review Entire Deck
                </button>
              </div>
            )}

            {/* Previous / Flip / Next + Rating Controls */}
            {currentCard && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={handlePrevCard}
                    disabled={cardsToReview.length <= 1}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 disabled:opacity-40 flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{isFlipped ? 'Show Question' : 'Reveal Answer'}</span>
                  </button>

                  <button
                    onClick={handleNextCard}
                    disabled={cardsToReview.length <= 1}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 disabled:opacity-40 flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleRate('needs_practice')}
                    className="py-3 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Need More Practice</span>
                  </button>

                  <button
                    onClick={() => handleRate('known')}
                    className="py-3 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Know It!</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Deck Stats & Mastery (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0F1E36] border border-slate-800 space-y-4 shadow-xl">
              <h3 className="font-bold text-sm text-white">Deck Performance</h3>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                  <span>Mastery Rate:</span>
                  <span className="font-mono font-bold text-teal-400">
                    {totalCards > 0 ? Math.round((knownCount / totalCards) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${totalCards > 0 ? (knownCount / totalCards) * 100 : 0}%` }}
                    className="bg-emerald-400 h-full transition-all"
                  />
                  <div
                    style={{ width: `${totalCards > 0 ? (missedCount / totalCards) * 100 : 0}%` }}
                    className="bg-amber-400 h-full transition-all"
                  />
                </div>
              </div>

              {/* Stats Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                  <div className="text-xl font-black text-emerald-400">{knownCount}</div>
                  <div className="text-[10px] text-emerald-300/80">Known</div>
                </div>
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40">
                  <div className="text-xl font-black text-amber-400">{missedCount}</div>
                  <div className="text-[10px] text-amber-300/80">Need Practice</div>
                </div>
              </div>

              {/* Inline Two-Step Delete Deck Confirmation */}
              {activeDeck.isCustom && (
                <div className="pt-3 border-t border-slate-800">
                  {confirmDeleteDeckId === activeDeck.id ? (
                    <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 space-y-2">
                      <p className="text-[11px] text-rose-200 font-medium">
                        Delete &ldquo;{activeDeck.title}&rdquo;?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDeleteActiveDeck}
                          className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteDeckId(null)}
                          className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteDeckId(activeDeck.id)}
                      className="w-full py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/80 text-rose-400 text-xs font-semibold border border-rose-900/60 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Custom Deck</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Add / Edit Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-[#0F1E36] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl text-white overflow-hidden">
            <div className="px-6 py-4 bg-[#0B192C] border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">
                {editingCardId ? 'Edit Flashcard' : 'Add Custom Flashcard (Works Offline)'}
              </h3>
              <button
                onClick={() => setShowCardModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveManualCard} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Front (Question / Prompt):
                </label>
                <textarea
                  rows={2}
                  required
                  value={cardFront}
                  onChange={(e) => setCardFront(e.target.value)}
                  placeholder="e.g. State Ohm's Law and write its formula."
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Back (Answer / Mark Scheme):
                </label>
                <textarea
                  rows={3}
                  required
                  value={cardBack}
                  onChange={(e) => setCardBack(e.target.value)}
                  placeholder="e.g. Current is directly proportional to potential difference at constant temperature (V = IR)."
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Exam Tip (Optional):
                  </label>
                  <input
                    type="text"
                    value={cardTip}
                    onChange={(e) => setCardTip(e.target.value)}
                    placeholder="e.g. Always mention constant temperature!"
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Difficulty:
                  </label>
                  <select
                    value={cardDifficulty}
                    onChange={(e) => setCardDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  {editingCardId ? 'Save Changes' : 'Add to Deck'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Generate Deck Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-[#0F1E36] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl text-white overflow-hidden">
            <div className="px-6 py-4 bg-[#0B192C] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h3 className="font-bold text-sm text-white">Generate Flashcards with AI</h3>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateDeck} className="p-6 space-y-4">
              {genError && (
                <div className="p-3 bg-rose-950 border border-rose-800 text-rose-300 rounded-xl text-xs">
                  {genError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Topic Name:
                </label>
                <input
                  type="text"
                  required
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="e.g. Enzyme Action or Circle Theorems"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Paste Notes or Syllabus Objectives (Optional):
                </label>
                <textarea
                  rows={3}
                  value={genNotes}
                  onChange={(e) => setGenNotes(e.target.value)}
                  placeholder="Paste class notes or specific formulas to turn into flashcards..."
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Number of Cards:</span>
                <div className="flex gap-2">
                  {[5, 10, 15].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setGenCount(cnt)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        genCount === cnt
                          ? 'bg-teal-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  {generating ? `Generating ${genCount} Flashcards...` : 'Create Deck'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
