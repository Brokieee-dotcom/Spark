# ScholarSpark AI

> **Tagline:** Understand more. Achieve more.

ScholarSpark AI is a dual-curriculum study companion engineered specifically for:
1. **ECZ (Examinations Council of Zambia)**: Grade 7, Grade 9, Grade 12, and GCE candidates.
2. **Cambridge Assessment International Education**: Cambridge IGCSE (Core and Extended), O-Level, and AS/A-Level students.

---

## Legal & Provenance Notice
ScholarSpark AI is an independent educational revision technology platform. **It is NOT affiliated with, sponsored by, or endorsed by the Examinations Council of Zambia (ECZ), Cambridge Assessment International Education, Google, or any official examination board.** All past examination paper structures and syllabus objectives are structured strictly after publicly accessible syllabus regulations and guidelines.

---

## Core Features & Modules

1. **Dual Curriculum Selector**:
   - Distinct syllabus maps for ECZ vs Cambridge IGCSE.
   - Grade/year selector (Grade 7, 9, 12, GCE, IGCSE Core/Extended, AS/A-Level).
   - Topic selector covering core objectives and paper breakdowns.

2. **AI Tutor**:
   - Interactive step-by-step tutoring with worked examples and formula breakdowns.
   - Adjustable explanation depth: **Simple** (relatable analogies), **Standard** (exam syllabus level), **Advanced** (distinction mark schemes).
   - Simple Language Mode with vocabulary glossaries and local language aids (Bemba, Nyanja/Chewa, Tonga).
   - Spoken explanation speech synthesis.

3. **Exam Practice & Rubric Marking**:
   - Multiple-choice and multi-part structured questions with allocated marks.
   - Questions displayed with answers strictly hidden until submission.
   - AI marking breakdown evaluating Method marks ($M$), Accuracy marks ($A$), and Independent marks ($B$).
   - Automatically logs quiz scores into the Weakness Detector.

4. **Past Paper Trainer**:
   - Organized by Curriculum, Subject, Year, and Paper Code.
   - Explicit provenance labels distinguishing verified syllabus blueprint papers from AI-generated practice.
   - Student upload feature to solve mock exam papers and teacher handouts.

5. **AI Homework Scanner**:
   - Upload question image or capture directly with device camera.
   - Multimodal OCR powered by server-side Gemini 3.8 Flash.
   - Editable OCR question text box allowing students to correct misread numbers.
   - Formulates step-by-step working, final answers with SI units, and common pitfalls.
   - Ephemeral processing with zero long-term retention of images.

6. **Voice Tutor**:
   - Hands-free audio study session using the Web Speech API.
   - Microphone permission requested strictly on user action.
   - Live recording pulse visualizer, editable transcription box, and spoken answers.

7. **Weakness Detector**:
   - Derived strictly from actual practice attempts across topics (never fabricated).
   - Topic-level accuracy rates, attempt counts, and trends (*Critical Weakness*, *Needs Attention*, *Improving*, *Mastered*).
   - 1-click action buttons to launch targeted AI Tutor lessons or diagnostic drills.

8. **Smart Flashcards**:
   - Interactive 3D flip cards with active recall ratings (*Know It* vs *Need More Practice*).
   - Spaced repetition filtering: review only missed cards.
   - AI Deck Generator synthesizes 10 syllabus cards from topics or student notes.

9. **AI Study Planner & Timetable**:
   - Full task management (add, edit, toggle completed, delete).
   - AI Timetable Generator incorporates identified weak topics into a balanced 7-day revision schedule.

10. **Challenge Mode**:
    - 2-minute timed speed recall blitz with streak multipliers.
    - Server-side score validation endpoint to prevent browser tampering.
    - Safe anonymous student leaderboards with age-appropriate pseudonyms.

11. **Notes Summarizer**:
    - Summarizes pasted notes into 3-sentence executive summaries, key terms glossary, checklists, and self-check questions.
    - Preserves source text separately alongside generated summaries.

12. **Progress Reports**:
    - Comprehensive student audit showing quizzes completed, average score, hours studied, and topic mastery.
    - Printable layout with `@media print` styling and JSON export.

13. **Exam Countdown**:
    - Real-time second-by-second countdown ticker to target exam dates with revision notes.

14. **Offline Revision**:
    - Local storage caching for saved notes, flashcard decks, and practice history.
    - Clear indicator showing online vs offline modes.

15. **Freemium Quota & Plan Management**:
    - Server-enforced daily rate limits (25 AI questions/day on Free tier).
    - Transparent plan toggling for preview testing without fake payment flows.

---

## Technical Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Motion.
- **Backend**: Express Node.js, `@google/genai` (Gemini 3.8 Flash), tsx.
- **Build Tool**: Vite.
- **Port**: 3000.
- **Deployment**: Google Cloud Run, Docker multi-stage container, GitHub Actions CI/CD.

---

## Local Development Quickstart

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set your `GEMINI_API_KEY`:
   ```bash
   cp .env.example .env
   ```

3. Run full-stack dev server:
   ```bash
   npm run dev
   ```

4. Build production bundle:
   ```bash
   npm run build
   ```
