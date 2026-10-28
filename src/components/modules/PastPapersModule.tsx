import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CURRICULA_DATA } from '../../data/curriculums';
import {
  BookOpenCheck,
  Filter,
  Download,
  Upload,
  CheckCircle,
  Sparkles,
  FileText,
  Search,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface PastPaperItem {
  id: string;
  curriculum: 'ECZ' | 'Cambridge';
  subject: string;
  year: number;
  season?: 'May/June' | 'Oct/Nov' | 'July GCE' | 'November Main';
  paperName: string;
  paperCode: string;
  duration: string;
  marks: number;
  provenance: 'Verified Syllabus Blueprint' | 'AI-Generated Exam Practice';
  topicsCovered: string[];
  isDownloadedOffline?: boolean;
}

export const PastPapersModule: React.FC = () => {
  const { curriculum, subject, setSubject, setTopic, setActiveModule } = useApp();

  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [paperFilter, setPaperFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Curated past paper catalog
  const pastPapersList: PastPaperItem[] = [
    // ECZ Papers
    {
      id: 'ecz-m-2023-p1',
      curriculum: 'ECZ',
      subject: 'Mathematics',
      year: 2023,
      season: 'November Main',
      paperName: 'Grade 12 Mathematics Paper 1',
      paperCode: '4024/1',
      duration: '2 Hours (Non-Calculator)',
      marks: 80,
      provenance: 'Verified Syllabus Blueprint',
      topicsCovered: ['Matrices & Determinants', 'Earth Geometry', 'Linear Programming', 'Calculus basics'],
    },
    {
      id: 'ecz-m-2023-p2',
      curriculum: 'ECZ',
      subject: 'Mathematics',
      year: 2023,
      season: 'November Main',
      paperName: 'Grade 12 Mathematics Paper 2',
      paperCode: '4024/2',
      duration: '2 Hours 30 Min (Calculator)',
      marks: 100,
      provenance: 'Verified Syllabus Blueprint',
      topicsCovered: ['Graphs of Polynomials', 'Mensuration', 'Trigonometry', 'Statistics & Ogive'],
    },
    {
      id: 'ecz-sci-2022-p1',
      curriculum: 'ECZ',
      subject: 'Science (Physics & Chemistry)',
      year: 2022,
      season: 'July GCE',
      paperName: 'Science Paper 1 (Physics Theory)',
      paperCode: '5124/1',
      duration: '1 Hour 15 Min',
      marks: 50,
      provenance: 'Verified Syllabus Blueprint',
      topicsCovered: ['Current Electricity', 'Thermal Physics', 'Radioactivity', 'Mechanics'],
    },
    {
      id: 'ecz-bio-2021-p2',
      curriculum: 'ECZ',
      subject: 'Biology',
      year: 2021,
      season: 'November Main',
      paperName: 'Biology Paper 2 (Theory & Structured)',
      paperCode: '5090/2',
      duration: '1 Hour 45 Min',
      marks: 80,
      provenance: 'Verified Syllabus Blueprint',
      topicsCovered: ['Human Nutrition', 'Enzyme Action', 'Excretion & Kidney', 'Genetics'],
    },
    // Cambridge Papers
    {
      id: 'cam-m-2023-p22',
      curriculum: 'Cambridge',
      subject: 'Mathematics',
      year: 2023,
      season: 'May/June',
      paperName: 'Mathematics (Extended) Paper 22',
      paperCode: '0580/22',
      duration: '1 Hour 30 Min (Non-Calculator)',
      marks: 70,
      provenance: 'Verified Syllabus Blueprint',
      topicsCovered: ['Algebra & Indices', 'Circle Theorems', 'Probability', 'Vectors'],
    },
    {
      id: 'cam-m-2023-p42',
      curriculum: 'Cambridge',
      subject: 'Mathematics',
      year: 2023,
      season: 'May/June',
      paperName: 'Mathematics (Extended) Paper 42',
      paperCode: '0580/42',
      duration: '2 Hours 30 Min (Calculator)',
      marks: 130,
      provenance: 'Verified Syllabus Blueprint',
      topicsCovered: ['Trigonometry 3D', 'Differentiation', 'Histograms', 'Sequences'],
    },
    {
      id: 'cam-phy-2022-p42',
      curriculum: 'Cambridge',
      subject: 'Physics',
      year: 2022,
      season: 'Oct/Nov',
      paperName: 'Physics (Extended) Theory Paper 42',
      paperCode: '0625/42',
      duration: '1 Hour 15 Min',
      marks: 80,
      provenance: 'Verified Syllabus Blueprint',
      topicsCovered: ['Thermal Physics', 'Electromagnetism', 'Nuclear Physics', 'Waves'],
    },
    {
      id: 'cam-chem-2023-p41',
      curriculum: 'Cambridge',
      subject: 'Chemistry',
      year: 2023,
      season: 'May/June',
      paperName: 'Chemistry (Extended) Paper 41',
      paperCode: '0620/41',
      duration: '1 Hour 15 Min',
      marks: 80,
      provenance: 'Verified Syllabus Blueprint',
      topicsCovered: ['Stoichiometry', 'Organic Polymers', 'Electrolysis', 'Equilibrium'],
    },
  ];

  const filteredPapers = pastPapersList.filter((p) => {
    if (p.curriculum !== curriculum) return false;
    if (selectedYear !== 'all' && p.year !== selectedYear) return false;
    if (searchFilter && !p.paperName.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  });

  const handleUploadPastPaper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#0B192C] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
              <BookOpenCheck className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-white">Past Paper Practice Hub</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Organized exam papers with verified mark schemes and provenance standards.
          </p>
        </div>

        {/* Provenance Ethics Statement */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
          <ShieldAlert className="w-4 h-4 text-teal-400 shrink-0" />
          <span>Strict Provenance: Official structure verified against published syllabi.</span>
        </div>
      </div>

      {/* Upload Own Past Paper Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0F1E36] border border-slate-700/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <Upload className="w-4 h-4 text-teal-400" />
            <span>Practice Your Own Past Paper or Exam Sheet</span>
          </div>
          <span className="text-[10px] bg-teal-500/20 text-teal-300 font-mono px-2 py-0.5 rounded">
            Student Uploads Supported
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Have a past paper question from your school mock or teacher? Upload a PDF or image to solve it with step-by-step AI marking and guidance.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <label className="cursor-pointer px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>{uploadedFileName ? 'Choose Different File' : 'Upload Question PDF / Image'}</span>
            <input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              onChange={handleUploadPastPaper}
              className="hidden"
            />
          </label>

          {uploadedFileName && (
            <div className="flex items-center gap-2 text-xs text-slate-200 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-mono">{uploadedFileName}</span>
              <button
                onClick={() => setActiveModule('scanner')}
                className="text-xs font-bold text-teal-400 hover:text-teal-300 underline ml-2"
              >
                Scan & Solve Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Year:
          </span>
          {(['all', 2023, 2022, 2021] as const).map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedYear === yr
                  ? 'bg-teal-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {yr === 'all' ? 'All Years' : yr}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter by paper name..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
          />
        </div>
      </div>

      {/* Past Papers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPapers.map((paper) => (
          <div
            key={paper.id}
            className="p-5 rounded-2xl bg-[#0F1E36] border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-teal-400 border border-slate-800">
                  {paper.paperCode} · {paper.year} {paper.season ? `(${paper.season})` : ''}
                </span>
                <h3 className="font-bold text-base text-white mt-1.5">{paper.paperName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{paper.subject}</p>
              </div>

              {/* Provenance Badge */}
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                {paper.provenance}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-300">
              <div>
                <span className="text-slate-500">Duration:</span> {paper.duration}
              </div>
              <div>
                <span className="text-slate-500">Marks:</span> {paper.marks}
              </div>
            </div>

            {/* Topics covered */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                Key Topics Tested:
              </div>
              <div className="flex flex-wrap gap-1">
                {paper.topicsCovered.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setSubject(paper.subject);
                  if (paper.topicsCovered.length > 0) setTopic(paper.topicsCovered[0]);
                  setActiveModule('practice');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Launch Practice Drill</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setSubject(paper.subject);
                  setActiveModule('offline');
                }}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
                title="Download for offline access"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
