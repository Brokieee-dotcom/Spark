import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { requestApi } from '../../services/api';
import {
  ScanLine,
  Upload,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BookOpen,
  Edit3,
  Bookmark,
  Check,
} from 'lucide-react';

interface HomeworkScanResult {
  extractedQuestion: string;
  subject?: string;
  topic?: string;
  difficulty?: string;
  keyConcepts?: string[];
  steps: {
    stepNumber: number;
    title: string;
    explanation: string;
    working: string;
  }[];
  finalAnswer: string;
  commonPitfalls?: string[];
}

export const HomeworkScannerModule: React.FC = () => {
  const { curriculum, subject, topic, profile, saveNote } = useApp();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scanResult, setScanResult] = useState<HomeworkScanResult | null>(null);
  const [editableQuestion, setEditableQuestion] = useState('');
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large. Please upload an image under 5MB.');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    setError(null);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setError('Camera permission denied or camera not supported on this device. Please use the file upload option.');
    }
  };

  const captureCameraFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      setMimeType('image/jpeg');
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);
    try {
      const res = await requestApi<{ result: HomeworkScanResult }>(
        '/api/homework/scan',
        {
          imageBase64: selectedImage,
          mimeType,
          curriculum,
          subject,
          additionalNotes,
        },
        { isPremium: profile.planTier === 'premium' }
      );

      setScanResult(res.data.result);
      setEditableQuestion(res.data.result.extractedQuestion || '');
    } catch (err: any) {
      console.error('OCR Scan error:', err);
      setError(err.message || 'Image analysis failed. Please ensure the question text is clear and readable.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToNotes = () => {
    if (!scanResult) return;
    saveNote({
      title: `Homework: ${scanResult.topic || subject}`,
      curriculum,
      subject: scanResult.subject || subject,
      topic: scanResult.topic || 'Homework Solution',
      originalNotes: editableQuestion,
      executiveSummary: `Final Answer: ${scanResult.finalAnswer}`,
      keyTerms: (scanResult.keyConcepts || []).map((c) => ({
        term: c,
        definition: 'Key concept identified during homework scan.',
      })),
      revisionPoints: scanResult.steps.map((s) => `${s.title}: ${s.explanation} (${s.working})`),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#0B192C] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
              <ScanLine className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-white">AI Homework Scanner & Solver</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Snap or upload any math, science, or theory question for instant step-by-step breakdown.
          </p>
        </div>

        <div className="text-[11px] text-teal-300 font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          Ephemeral Processing · Images Never Stored Long-Term
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
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

      {/* Main Upload / Camera Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Capture & Image View (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0F1E36] border border-slate-800 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-teal-400" /> Upload Question Image
            </h3>

            {/* Live Camera View */}
            {cameraActive ? (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />

                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                  <button
                    onClick={captureCameraFrame}
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
                  >
                    Take Photo
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : selectedImage ? (
              /* Image Preview */
              <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-700 aspect-4/3 flex items-center justify-center group">
                <img
                  src={selectedImage}
                  alt="Homework Question"
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setScanResult(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-rose-400 hover:text-white hover:bg-rose-900 text-xs transition-colors"
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            ) : (
              /* Dropzone / Upload Triggers */
              <div className="border-2 border-dashed border-slate-700 hover:border-teal-400/80 rounded-2xl p-6 text-center transition-colors">
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-400 mb-3">
                  <Upload className="w-6 h-6 text-teal-400" />
                </div>
                <div className="text-xs font-semibold text-white">
                  Drag and drop your question image, or browse
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports PNG, JPEG, WebP up to 5MB
                </p>

                <div className="flex items-center justify-center gap-3 mt-4">
                  <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors">
                    <span>Browse Files</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={startCamera}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 text-teal-400" />
                    <span>Use Camera</span>
                  </button>
                </div>
              </div>
            )}

            {/* Optional student note */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Specific area you are stuck on (optional):
              </label>
              <input
                type="text"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g. 'I do not understand part (b) calculation'"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !selectedImage}
              className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Scanning with Gemini Multimodal OCR...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Scan Question & Explain Solution</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Solution Breakdown & Editable OCR Text (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {scanResult ? (
            <div className="p-6 rounded-2xl bg-[#0F1E36] border border-slate-800 space-y-6 shadow-xl">
              {/* Header with Save Note */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                      Solution Breakdown
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                      {scanResult.topic || topic}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    Verified Step-by-Step Methodology
                  </h3>
                </div>

                <button
                  onClick={handleSaveToNotes}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save to Notes</span>
                    </>
                  )}
                </button>
              </div>

              {/* Editable Extracted Question Box */}
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Extracted Question Text (OCR):</span>
                  <button
                    onClick={() => setIsEditingQuestion(!isEditingQuestion)}
                    className="text-teal-400 hover:text-teal-300 flex items-center gap-1 text-[11px]"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEditingQuestion ? 'Done Editing' : 'Correct OCR'}</span>
                  </button>
                </div>

                {isEditingQuestion ? (
                  <textarea
                    rows={3}
                    value={editableQuestion}
                    onChange={(e) => setEditableQuestion(e.target.value)}
                    className="w-full p-2 bg-slate-900 border border-teal-500 rounded text-xs text-white font-mono focus:outline-none"
                  />
                ) : (
                  <p className="text-xs text-slate-200 font-medium whitespace-pre-wrap">
                    {editableQuestion}
                  </p>
                )}
              </div>

              {/* Key concepts */}
              {scanResult.keyConcepts && scanResult.keyConcepts.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Required Formulas & Concepts:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {scanResult.keyConcepts.map((c, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Worked Steps */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Step-by-Step Working:
                </div>
                {scanResult.steps.map((st) => (
                  <div
                    key={st.stepNumber}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {st.stepNumber}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-white">{st.title}</span>
                    </div>
                    <p className="text-xs text-slate-300 pl-7">{st.explanation}</p>
                    {st.working && (
                      <div className="ml-7 p-2 bg-slate-950 rounded font-mono text-xs text-teal-300 border border-slate-800/80">
                        {st.working}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Final Answer Highlight */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Final Answer:
                </span>
                <div className="text-base font-extrabold text-white font-mono mt-1">
                  {scanResult.finalAnswer}
                </div>
              </div>

              {/* Pitfalls */}
              {scanResult.commonPitfalls && scanResult.commonPitfalls.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="w-4 h-4" /> Common Exam Mistakes to Avoid:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300 pt-1">
                    {scanResult.commonPitfalls.map((pit, pIdx) => (
                      <li key={pIdx}>{pit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            /* Empty placeholder state */
            <div className="h-full min-h-[350px] p-8 rounded-2xl bg-[#0F1E36]/40 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500">
                <ScanLine className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="font-bold text-base text-white">No Homework Scanned Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Upload a photo or textbook snippet on the left to receive complete pedagogical working, formulas, and common pitfalls.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
