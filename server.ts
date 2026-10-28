import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parser limits for image uploads (Homework Scanner)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize GoogleGenAI SDK with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Simple in-memory rate limiter / quota tracker for Freemium tier
interface QuotaRecord {
  count: number;
  resetTime: number;
}
const ipQuotas = new Map<string, QuotaRecord>();
const FREE_DAILY_LIMIT = 25; // 25 AI queries per 24 hours on free tier

function checkQuota(req: Request, res: Response, next: () => void) {
  const isPremium = req.headers['x-spark-tier'] === 'premium';
  if (isPremium) {
    res.setHeader('X-Quota-Tier', 'premium');
    res.setHeader('X-Quota-Remaining', 'unlimited');
    return next();
  }

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'local';
  const now = Date.now();
  let record = ipQuotas.get(clientIp);

  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + 24 * 60 * 60 * 1000,
    };
    ipQuotas.set(clientIp, record);
  }

  if (record.count >= FREE_DAILY_LIMIT) {
    const hoursLeft = Math.ceil((record.resetTime - now) / (1000 * 60 * 60));
    res.setHeader('X-Quota-Tier', 'free');
    res.setHeader('X-Quota-Remaining', '0');
    return res.status(429).json({
      error: 'Daily free AI quota reached (25/25 requests). Upgrade to ScholarSpark Premium or wait for your daily quota to reset in ' + hoursLeft + ' hours.',
      quotaExceeded: true,
      hoursLeft,
    });
  }

  record.count += 1;
  const remaining = FREE_DAILY_LIMIT - record.count;
  res.setHeader('X-Quota-Tier', 'free');
  res.setHeader('X-Quota-Remaining', remaining.toString());
  res.setHeader('X-Quota-Limit', FREE_DAILY_LIMIT.toString());
  next();
}

// ==========================================
// 1. Health & Status
// ==========================================
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ScholarSpark AI Full-Stack Service',
    time: new Date().toISOString(),
    apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    curriculumsSupported: ['ECZ (Examinations Council of Zambia)', 'Cambridge IGCSE'],
  });
});

// ==========================================
// 2. AI Tutor
// ==========================================
app.post('/api/tutor', checkQuota, async (req: Request, res: Response) => {
  try {
    const {
      message,
      curriculum = 'ECZ',
      grade = 'Grade 12',
      subject = 'Mathematics',
      topic = 'General',
      difficulty = 'standard', // 'simple' | 'standard' | 'advanced'
      simpleLanguageMode = false,
      localLanguage = 'none', // 'bemba' | 'nyanja' | 'tonga' | 'none'
      history = [],
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A question or message is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is configured in Settings > Secrets.',
      });
    }

    let localLangPrompt = '';
    if (localLanguage === 'bemba') {
      localLangPrompt = 'Include brief, polite Zambian Bemba terminology/phrasing aids (e.g., explaining concepts in relatable terms) alongside formal English.';
    } else if (localLanguage === 'nyanja') {
      localLangPrompt = 'Include brief, polite Zambian Nyanja/Chewa terminology/phrasing aids alongside formal English.';
    } else if (localLanguage === 'tonga') {
      localLangPrompt = 'Include brief, polite Zambian Tonga terminology/phrasing aids alongside formal English.';
    }

    const systemInstruction = `
You are ScholarSpark AI, an elite educational tutor specifically tailored for students sitting either:
1. ECZ (Examinations Council of Zambia - Grades 7, 9, 12, and GCE).
2. Cambridge Assessment International Education (IGCSE Core/Extended, O-Level, AS/A-Level).

CURRENT STUDENT CONTEXT:
- Target Curriculum: ${curriculum}
- Level / Grade: ${grade}
- Subject: ${subject}
- Topic: ${topic}
- Explanation Tier: ${difficulty} (simple: relatable analogies, zero jargon; standard: balanced exam-level clarity; advanced: distinction mark-scheme nuances, method & accuracy marks).
- Simple Language Mode: ${simpleLanguageMode ? 'ACTIVE - use short sentences, direct analogies, and define any technical term in parentheses.' : 'STANDARD'}.
${localLangPrompt ? `- Local Language Aid: ${localLangPrompt}` : ''}

RULES:
- Provide clear, pedagogical explanations with worked step-by-step examples when solving problems.
- If the student asks for mathematics or science calculations, explicitly display the formula first, state given values, show step-by-step substitution, and conclude with the final answer with correct units.
- Never claim affiliation with or endorsement by ECZ, Cambridge International, or Google.
- If there is uncertainty or syllabus variance between years, state it clearly.
- Provide 2-3 proactive follow-up suggestions at the end to prompt deeper inquiry.
`;

    // Build conversation context
    const conversationContents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const turn of history.slice(-6)) {
        conversationContents.push({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.content }],
        });
      }
    }
    conversationContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: conversationContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I apologize, but I could not formulate an explanation for that question.';
    return res.json({ reply });
  } catch (err: any) {
    console.error('Tutor API Error:', err);
    return res.status(500).json({
      error: err.message || 'An error occurred while generating the tutor explanation.',
    });
  }
});

// ==========================================
// 3. AI Homework Scanner (Multimodal OCR & Solver)
// ==========================================
app.post('/api/homework/scan', checkQuota, async (req: Request, res: Response) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      curriculum = 'ECZ',
      subject = 'Mathematics',
      additionalNotes = '',
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    // Clean base64 string if it contains data URI prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const promptText = `
Inspect this student's homework question image.
Target Curriculum: ${curriculum}
Subject: ${subject}
${additionalNotes ? `Student note: ${additionalNotes}` : ''}

You must return a valid JSON object matching the requested schema.
- Extract the verbatim text of the question exactly as seen so the student can verify OCR accuracy.
- Identify the syllabus topic.
- Break down the complete step-by-step solution showing all working, formulas, and reasoning.
- Provide the final answer clearly with units.
- Note any common pitfalls or mark loss points students usually make on this specific question.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedQuestion: {
              type: Type.STRING,
              description: 'The verbatim text read from the image.',
            },
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            difficulty: { type: Type.STRING, description: 'Core, Extended, or Advanced' },
            keyConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of key theorems, formulas, or rules needed.',
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  working: { type: Type.STRING },
                },
                required: ['stepNumber', 'title', 'explanation', 'working'],
              },
            },
            finalAnswer: { type: Type.STRING },
            commonPitfalls: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['extractedQuestion', 'topic', 'steps', 'finalAnswer'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ result: parsed });
  } catch (err: any) {
    console.error('Homework Scan Error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to scan and analyze homework image. Ensure the image is clear and well-lit.',
    });
  }
});

// ==========================================
// 4. Exam Practice Generator (Authentic Questions)
// ==========================================
app.post('/api/practice/generate', checkQuota, async (req: Request, res: Response) => {
  try {
    const {
      curriculum = 'ECZ',
      grade = 'Grade 12',
      subject = 'Mathematics',
      topic = 'Algebra',
      count = 5,
      type = 'mixed', // 'mcq' | 'structured' | 'mixed'
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const systemInstruction = `
You are an expert exam item writer for ${curriculum} (${grade}) in ${subject}.
Generate ${count} realistic, curriculum-aligned exam practice questions on the topic "${topic}".
Each question MUST be clearly categorized as "AI-Generated Exam Practice" (never claim it is an official leaked paper).
Format should match authentic exam conventions:
- For ECZ: Follow ECZ Paper 1 (non-calculator, foundational/structured) or Paper 2 (calculator, structured, graphing, multi-step).
- For Cambridge: Follow IGCSE Core/Extended (Papers 1/3 or 2/4) or Sciences (Paper 2 MCQ / Paper 4 Theory).
Include mark distribution [e.g., 2 marks, 3 marks, 4 marks] and detailed marking rubrics (Method M-marks, Accuracy A-marks).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate ${count} questions of type ${type} for topic "${topic}". Include detailed rubrics and model answers.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              curriculum: { type: Type.STRING },
              subject: { type: Type.STRING },
              topic: { type: Type.STRING },
              questionType: { type: Type.STRING, description: 'multiple_choice or structured' },
              totalMarks: { type: Type.INTEGER },
              questionText: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Four options A, B, C, D if multiple_choice, otherwise empty.',
              },
              correctOptionIndex: {
                type: Type.INTEGER,
                description: '0-indexed correct option if multiple_choice, -1 if structured',
              },
              modelAnswer: { type: Type.STRING },
              markingScheme: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    markType: { type: Type.STRING, description: 'M1 (Method), A1 (Accuracy), B1 (Independent)' },
                    criterion: { type: Type.STRING },
                  },
                  required: ['markType', 'criterion'],
                },
              },
              explanation: { type: Type.STRING },
              hint: { type: Type.STRING },
            },
            required: ['id', 'questionType', 'totalMarks', 'questionText', 'modelAnswer', 'explanation'],
          },
        },
      },
    });

    const questions = JSON.parse(response.text || '[]');
    return res.json({ questions });
  } catch (err: any) {
    console.error('Practice Generation Error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate practice questions.',
    });
  }
});

// ==========================================
// 5. Answer Marking (Rubric & Method Evaluation)
// ==========================================
app.post('/api/practice/mark', checkQuota, async (req: Request, res: Response) => {
  try {
    const {
      questionText,
      studentAnswer,
      modelAnswer,
      totalMarks = 3,
      markingScheme = [],
      curriculum = 'ECZ',
      subject = 'Mathematics',
    } = req.body;

    if (!questionText || studentAnswer === undefined) {
      return res.status(400).json({ error: 'Question text and student answer are required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const promptText = `
You are an official examiner for ${curriculum} (${subject}).
Carefully grade the student's answer against the model answer and marking scheme.

QUESTION:
${questionText}

TOTAL MARKS AVAILABLE:
${totalMarks}

RUBRIC / SCHEME:
${JSON.stringify(markingScheme)}

MODEL ANSWER:
${modelAnswer}

STUDENT SUBMITTED ANSWER:
${studentAnswer}

Evaluate:
1. Marks awarded (an integer between 0 and ${totalMarks}).
2. Did the student show appropriate method / working (method marks)?
3. Is the final numerical value / statement accurate (accuracy marks)?
4. Constructive feedback explaining exactly where marks were awarded or dropped.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marksAwarded: { type: Type.INTEGER },
            totalMarks: { type: Type.INTEGER },
            isFullyCorrect: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING },
            rubricBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  markCode: { type: Type.STRING },
                  awarded: { type: Type.BOOLEAN },
                  reason: { type: Type.STRING },
                },
                required: ['markCode', 'awarded', 'reason'],
              },
            },
            remedialTip: { type: Type.STRING },
          },
          required: ['marksAwarded', 'totalMarks', 'isFullyCorrect', 'feedback'],
        },
      },
    });

    const evaluation = JSON.parse(response.text || '{}');
    return res.json({ evaluation });
  } catch (err: any) {
    console.error('Answer Marking Error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to grade answer.',
    });
  }
});

// ==========================================
// 6. Smart Flashcards Generator
// ==========================================
app.post('/api/flashcards/generate', checkQuota, async (req: Request, res: Response) => {
  try {
    const {
      curriculum = 'ECZ',
      subject = 'Science',
      topic = 'Photosynthesis',
      notes = '',
      count = 10,
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const promptText = `
Create ${count} high-yield revision flashcards for ${curriculum} students in ${subject}.
Topic: ${topic}
${notes ? `Student's custom notes to synthesize:\n"""${notes}"""` : 'Generate from standard syllabus objectives.'}

Create concise question-and-answer pairs:
- Front: A sharp, syllabus-oriented prompt, definition request, formula question, or calculation.
- Back: The crisp, authoritative answer (1-3 sentences max) with key terms underlined or bolded.
- Tip: A memorable mnemonic or exam advice to avoid losing marks.
- Difficulty: 'easy', 'medium', or 'hard'.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              front: { type: Type.STRING },
              back: { type: Type.STRING },
              tip: { type: Type.STRING },
              difficulty: { type: Type.STRING },
            },
            required: ['front', 'back', 'tip', 'difficulty'],
          },
        },
      },
    });

    const cards = JSON.parse(response.text || '[]');
    return res.json({ cards });
  } catch (err: any) {
    console.error('Flashcard Generation Error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate flashcards.',
    });
  }
});

// ==========================================
// 7. Notes Summarizer
// ==========================================
app.post('/api/notes/summarize', checkQuota, async (req: Request, res: Response) => {
  try {
    const { text, curriculum = 'ECZ', subject = 'Biology' } = req.body;

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: 'Please provide notes with at least 20 characters.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    // Limit text length to prevent huge token consumption
    const cleanText = text.slice(0, 15000);

    const promptText = `
Summarize these student study notes for ${curriculum} (${subject}):
"""
${cleanText}
"""

Produce:
1. An executive summary (3 clear, high-yield paragraphs).
2. Key terms with syllabus-exact definitions.
3. High-yield revision points (bullet checklist).
4. 3 diagnostic self-check questions with answers.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyTerms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  examRelevance: { type: Type.STRING },
                },
                required: ['term', 'definition'],
              },
            },
            revisionPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            practiceQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                },
                required: ['question', 'answer'],
              },
            },
          },
          required: ['summary', 'keyTerms', 'revisionPoints', 'practiceQuestions'],
        },
      },
    });

    const summaryData = JSON.parse(response.text || '{}');
    return res.json({ summary: summaryData });
  } catch (err: any) {
    console.error('Notes Summarize Error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to summarize notes.',
    });
  }
});

// ==========================================
// 8. AI Study Timetable Generator
// ==========================================
app.post('/api/timetable/generate', checkQuota, async (req: Request, res: Response) => {
  try {
    const {
      dailyHours = 3,
      examDate,
      curriculum = 'ECZ',
      subjects = ['Mathematics', 'Science'],
      weakTopics = [],
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const promptText = `
Generate a balanced, realistic 7-day study timetable for a ${curriculum} student.
- Daily available hours: ${dailyHours} hours/day.
- Target Exam Date: ${examDate || 'In 6 weeks'}.
- Key Subjects: ${subjects.join(', ')}.
- Identified Weak Topics (needs extra priority!): ${weakTopics.length > 0 ? weakTopics.join(', ') : 'None specified yet (balance across core syllabus)'}.

Generate 7 daily schedules with specific blocks, rest breaks (Pomodoro style), active recall sessions, and past paper drills.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategyOverview: { type: Type.STRING },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayName: { type: Type.STRING, description: 'Monday, Tuesday, etc.' },
                  focusTheme: { type: Type.STRING },
                  sessions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING },
                        durationMinutes: { type: Type.INTEGER },
                        subject: { type: Type.STRING },
                        topic: { type: Type.STRING },
                        activityType: { type: Type.STRING, description: 'Concept Learning, Practice Drill, Past Paper, Review' },
                        priority: { type: Type.STRING, description: 'high, medium, low' },
                      },
                      required: ['time', 'durationMinutes', 'subject', 'topic', 'activityType'],
                    },
                  },
                },
                required: ['dayName', 'focusTheme', 'sessions'],
              },
            },
          },
          required: ['strategyOverview', 'days'],
        },
      },
    });

    const timetable = JSON.parse(response.text || '{}');
    return res.json({ timetable });
  } catch (err: any) {
    console.error('Timetable Generation Error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate timetable.',
    });
  }
});

// ==========================================
// 9. Challenge Mode Server Validation
// ==========================================
app.post('/api/challenge/submit', (req: Request, res: Response) => {
  const { challengeId, completedQuestions, totalQuestions, elapsedSeconds } = req.body;

  if (!challengeId || completedQuestions === undefined || !totalQuestions) {
    return res.status(400).json({ error: 'Missing challenge payload' });
  }

  // Anti-tamper checks: human speed threshold
  const minPossibleSeconds = totalQuestions * 3; // at least 3 seconds per question
  if (elapsedSeconds < minPossibleSeconds) {
    return res.status(400).json({
      error: 'Submission invalidated due to impossible completion speed.',
      tampered: true,
    });
  }

  const accuracy = Math.round((completedQuestions / totalQuestions) * 100);
  const speedBonus = Math.max(0, 300 - elapsedSeconds);
  const validatedScore = completedQuestions * 100 + speedBonus;

  return res.json({
    verified: true,
    score: validatedScore,
    accuracy,
    speedBonus,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 10. Vite Middleware (Dev) or Static Server (Prod)
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built static assets from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScholarSpark AI server running on http://0.0.0.0:${PORT} [${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
