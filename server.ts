import express, { Request, Response } from 'express';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import JSZip from 'jszip';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security & CORS configuration for full-stack and GitHub Pages branch deployments
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string): boolean {
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    return true;
  }
  return /^https:\/\/[a-zA-Z0-9-]+\.github\.io$/.test(origin);
}

app.use((req: Request, res: Response, next: () => void) => {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'X-Quota-Tier, X-Quota-Remaining, X-Quota-Limit');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

// Body parser limits for image uploads (Homework Scanner)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const rawApiKey = (process.env.GEMINI_API_KEY || '').trim();
const isApiKeyConfigured =
  Boolean(rawApiKey) &&
  rawApiKey !== 'YOUR_GEMINI_API_KEY_HERE' &&
  rawApiKey !== 'MY_GEMINI_API_KEY';

// Initialize GoogleGenAI SDK with required User-Agent
const ai = new GoogleGenAI({
  apiKey: isApiKeyConfigured ? rawApiKey : undefined,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const modelCooldownUntil = new Map<string, number>();
const RATE_LIMIT_COOLDOWN_MS = 2 * 60 * 1000;

function isRateLimitError(err: any): boolean {
  const msg = String(err?.message || '');
  const status = err?.status || err?.code;
  return (
    status === 429 ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('Resource has been exhausted') ||
    msg.includes('quota')
  );
}

function isTransientCapacityError(err: any): boolean {
  const msg = String(err?.message || '');
  const status = err?.status || err?.code;
  return (
    status === 503 ||
    msg.includes('503') ||
    msg.includes('high demand') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('temporarily')
  );
}

function orderModelsWithCooldown(candidates: string[]): string[] {
  const unique = Array.from(new Set(candidates));
  const now = Date.now();
  const ready = unique.filter((m) => (modelCooldownUntil.get(m) || 0) <= now);
  return ready.length > 0 ? ready : unique;
}

/**
 * Resilient Gemini Call with Smart Cooldown & Model Failover.
 * Uses active free-tier models ('gemini-3.1-flash-lite', 'gemini-4-hydrogen', 'gemini-flash-latest').
 * Immediately rotates on 429 quota/rate limits without retrying the exhausted model.
 */
async function callGeminiSafe(params: {
  contents: any;
  config?: any;
  preferredModel?: string;
}): Promise<any> {
  const ordered = orderModelsWithCooldown([
    params.preferredModel || 'gemini-3.1-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-4-hydrogen',
    'gemini-flash-latest',
  ]);

  let lastError: any = null;

  for (const model of ordered) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const configForModel = { ...params.config };
        if (model !== 'gemini-4-hydrogen' && configForModel?.thinkingConfig) {
          delete configForModel.thinkingConfig;
        }
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: configForModel,
        });
        return response;
      } catch (err: any) {
        lastError = err;

        if (isRateLimitError(err)) {
          modelCooldownUntil.set(model, Date.now() + RATE_LIMIT_COOLDOWN_MS);
          console.info(`[Gemini Router] ${model} quota busy (429); rotating immediately.`);
          break;
        }

        if (isTransientCapacityError(err) && attempt === 1) {
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }

        break;
      }
    }
  }

  throw lastError || new Error('The AI service is temporarily experiencing high load across all endpoints. Please retry in a few seconds.');
}

function formatGeminiError(err: any, fallbackMsg: string): { status: number; message: string } {
  const rawMsg = String(err?.message || '');
  const status = err?.status || err?.code;
  if (status === 429 || rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('"code":429')) {
    return {
      status: 429,
      message:
        'Gemini API rate limit or free-tier quota reached. Please wait a few seconds and retry, or upgrade to a billing-enabled API key in Settings > Secrets.',
    };
  }
  if (
    status === 403 ||
    rawMsg.includes('PERMISSION_DENIED') ||
    rawMsg.includes('API_KEY_INVALID')
  ) {
    return {
      status: 403,
      message:
        'Gemini API key permission error. Please verify your GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  return { status: 500, message: rawMsg || fallbackMsg };
}

interface GroundingSource {
  title: string;
  uri: string;
}

function extractGroundingSources(response: any): GroundingSource[] {
  const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!Array.isArray(chunks)) return [];
  const seen = new Set<string>();
  const sources: GroundingSource[] = [];
  for (const chunk of chunks) {
    const uri = chunk?.web?.uri;
    const title = chunk?.web?.title || uri;
    if (typeof uri === 'string' && uri.startsWith('http') && !seen.has(uri)) {
      seen.add(uri);
      sources.push({ title: String(title), uri });
    }
  }
  return sources;
}

async function sendChatWithRetry(params: {
  model: string;
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
  message: string;
  config: any;
}): Promise<{ response: any; modelUsed: string }> {
  const candidates = orderModelsWithCooldown([
    params.model,
    'gemini-3.1-flash-lite',
    'gemini-4-hydrogen',
    'gemini-flash-latest',
  ]);

  let lastError: any = null;
  for (const model of candidates) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const configForModel = { ...params.config };
        if (model !== 'gemini-4-hydrogen' && configForModel.thinkingConfig) {
          delete configForModel.thinkingConfig;
        }
        // Only gemini-4-hydrogen uses googleSearch here
        if (model !== 'gemini-4-hydrogen' && configForModel.tools) {
          delete configForModel.tools;
        }

        const chat = ai.chats.create({
          model,
          history: params.history,
          config: configForModel,
        });
        const response = await chat.sendMessage({ message: params.message });
        return { response, modelUsed: model };
      } catch (err: any) {
        lastError = err;

        if (isRateLimitError(err)) {
          modelCooldownUntil.set(model, Date.now() + RATE_LIMIT_COOLDOWN_MS);
          console.info(`[Gemini Chat Router] ${model} quota busy (429); failing over immediately.`);
          break;
        }

        if (isTransientCapacityError(err) && attempt === 1) {
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }

        break;
      }
    }
  }
  throw lastError || new Error('The AI chat service is temporarily unavailable. Please retry.');
}

// Simple in-memory rate limiter / quota tracker for Freemium tier
interface QuotaRecord {
  count: number;
  resetTime: number;
}
const ipQuotas = new Map<string, QuotaRecord>();
const FREE_DAILY_LIMIT = 50; // Generous free tier limit

function getClientKey(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'local';
}

function getOrResetQuota(clientKey: string): QuotaRecord {
  const now = Date.now();
  let record = ipQuotas.get(clientKey);
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + 24 * 60 * 60 * 1000,
    };
    ipQuotas.set(clientKey, record);
  }
  return record;
}

// Server-enforced freemium quota (cannot be bypassed by client headers or frontend state)
function checkQuota(req: Request, res: Response, next: () => void) {
  const clientIp = getClientKey(req);
  const now = Date.now();
  const record = getOrResetQuota(clientIp);

  if (record.count >= FREE_DAILY_LIMIT) {
    const hoursLeft = Math.ceil((record.resetTime - now) / (1000 * 60 * 60));
    res.setHeader('X-Quota-Tier', 'free');
    res.setHeader('X-Quota-Remaining', '0');
    res.setHeader('X-Quota-Limit', FREE_DAILY_LIMIT.toString());
    return res.status(429).json({
      error: `Daily free AI quota reached (${FREE_DAILY_LIMIT}/${FREE_DAILY_LIMIT} requests). Your free daily allowance resets in ${hoursLeft} hour(s).`,
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

export function parseSafeJson<T>(raw: string, fallback: T): T {
  try {
    let cleaned = raw.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn('JSON parse fallback used on raw response:', raw.slice(0, 100));
    return fallback;
  }
}

function parseRequiredJson<T>(raw: string | undefined, endpointLabel: string): T {
  const text = (raw || '').trim();
  if (!text) {
    throw new Error(`${endpointLabel} returned an empty AI response. Please retry.`);
  }
  let cleaned = text;
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned) as T;
}

// ==========================================
// 1. Health & Status
// ==========================================
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ScholarSpark AI Resilient Full-Stack Service',
    time: new Date().toISOString(),
    apiKeyConfigured: isApiKeyConfigured,
    models: ['gemini-3.1-flash-lite (Primary)', 'gemini-4-hydrogen (Search/Reasoning)', 'gemini-flash-latest (Failover)'],
    curriculumsSupported: [
      'ECZ (Examinations Council of Zambia · Grades 7–12)',
      'Zambia CBC (2023 Competence-Based Curriculum · Forms 1–6 O-Level & A-Level)',
      'Cambridge IGCSE',
    ],
  });
});

app.get('/api/quota', (req: Request, res: Response) => {
  const clientIp = getClientKey(req);
  const record = getOrResetQuota(clientIp);
  const remaining = Math.max(0, FREE_DAILY_LIMIT - record.count);
  res.json({
    tier: 'free',
    remaining,
    limit: FREE_DAILY_LIMIT,
    resetTime: new Date(record.resetTime).toISOString(),
  });
});

// ==========================================
// 1b. Downloadable VS Code Project Bundle
// ==========================================
const EXCLUDED_DIRS = new Set([
  'node_modules',
  'dist',
  'dist-server',
  'docs',
  '.git',
  'coverage',
  '.nyc_output',
]);

function shouldExcludeFile(filename: string): boolean {
  if (
    filename === '.env' ||
    filename.startsWith('.env.local') ||
    filename.startsWith('.env.production') ||
    filename === 'bun.lock' ||
    filename.startsWith('service-account')
  ) {
    return true;
  }
  const lower = filename.toLowerCase();
  return (
    lower.endsWith('.key') ||
    lower.endsWith('.pem') ||
    lower.endsWith('.log') ||
    lower.endsWith('.zip')
  );
}

function addDirToZip(zipFolder: JSZip, dirPath: string) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      const subFolder = zipFolder.folder(entry.name);
      if (subFolder) {
        addDirToZip(subFolder, path.join(dirPath, entry.name));
      }
    } else if (entry.isFile()) {
      if (shouldExcludeFile(entry.name)) continue;
      const fullPath = path.join(dirPath, entry.name);
      zipFolder.file(entry.name, fs.readFileSync(fullPath));
    }
  }
}

app.get('/api/export/vscode-bundle', async (_req: Request, res: Response) => {
  try {
    const zip = new JSZip();
    const rootFolder = zip.folder('ScholarSpark-AI');
    if (!rootFolder) {
      return res.status(500).json({ error: 'Unable to initialize ZIP archive.' });
    }

    addDirToZip(rootFolder, __dirname);

    const buffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="ScholarSpark-AI-VSCode.zip"');
    res.setHeader('Content-Length', buffer.length.toString());
    return res.send(buffer);
  } catch (err: any) {
    console.error('VS Code Bundle Export Error:', err);
    return res.status(500).json({ error: 'Failed to package VS Code project archive.' });
  }
});

// ==========================================
// 2. Multi-Turn AI Chatbot & Search Grounding
// ==========================================
type TutorRole = 'examiner' | 'fast_coach' | 'deep_reasoner' | 'web_researcher';

app.post('/api/tutor', checkQuota, async (req: Request, res: Response) => {
  try {
    const {
      message,
      curriculum = 'ECZ',
      grade = 'Grade 12',
      subject = 'Mathematics',
      topic = 'General',
      difficulty = 'standard',
      simpleLanguageMode = false,
      localLanguage = 'none',
      tutorRole = 'examiner',
      useSearchGrounding = false,
      history = [],
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A question or message is required.' });
    }

    if (!isApiKeyConfigured) {
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

    const validRole: TutorRole = ['examiner', 'fast_coach', 'deep_reasoner', 'web_researcher'].includes(tutorRole)
      ? tutorRole
      : 'examiner';

    const roleDescriptions: Record<TutorRole, string> = {
      examiner:
        'ROLE — Syllabus Examiner & Tutor: Deliver clear pedagogical explanations aligned with official mark schemes, highlighting Method (M) and Accuracy (A) marks.',
      fast_coach:
        'ROLE — Fast Study Coach: Deliver crisp, high-speed revision summaries, key formulas, and concise 1-minute exam checkpoints.',
      deep_reasoner:
        'ROLE — Deep Step-by-Step Solver: Perform rigorous multi-step derivations, proof checks, and error diagnostics for challenging problems.',
      web_researcher:
        'ROLE — Live Web-Grounded Researcher: Use Google Search grounding to retrieve up-to-date facts, current syllabus announcements, exam dates, and real-world scientific/economic context.',
    };

    const systemInstruction = `
You are ScholarSpark AI, an educational chatbot specifically tailored for students sitting:
1. ECZ Legacy Syllabi (Examinations Council of Zambia - Grades 7, 9, 12, and GCE).
2. Zambia Competence-Based Curriculum (ZambiaCBC / 2023 ZECF - Form 1–4 Ordinary Level across 8 career pathways with practical/SBA competence and Term 1/Term 2 formative assessments for Forms 1–3, plus Form 5–6 Advanced Level / A-Level specializations).
3. Cambridge Assessment International Education (IGCSE Core/Extended, O-Level, AS/A-Level).

${roleDescriptions[validRole]}

CURRENT STUDENT CONTEXT:
- Target Curriculum: ${curriculum}
- Level / Grade: ${grade}
- Subject: ${subject}
- Topic: ${topic}
- Explanation Tier: ${difficulty} (simple: relatable analogies, zero jargon; standard: balanced exam-level clarity; advanced: distinction mark-scheme nuances, method & accuracy marks).
- Simple Language Mode: ${simpleLanguageMode ? 'ACTIVE - use short sentences, direct analogies, and define any technical term in parentheses.' : 'STANDARD'}.
${localLangPrompt ? `- Local Language Aid: ${localLangPrompt}` : ''}

RULES:
- If Target Curriculum is ZambiaCBC (or Level is Form 1/2/3/4/5/6), adapt depth cleanly: Forms 1–2 foundational competence concepts, Forms 3–4 applied O-Level pathways and SBA skills, and Forms 5–6 rigorous A-Level pre-university depth.
- Answer directly, truthfully, and accurately based on verified academic knowledge and real syllabus principles. If you are unsure of a specific recent circular or date, state that clearly instead of guessing.
- Maintain continuity across the multi-turn conversation thread.
- Provide clear, pedagogical explanations with worked step-by-step examples when solving problems.
- For mathematics or science calculations, explicitly display the formula first, state given values, show step-by-step substitution, and conclude with the final answer and units.
- Never claim affiliation with or endorsement by ECZ, Ministry of Education / CDC Zambia, Cambridge International, or Google.
- End with 2-3 proactive follow-up prompts to continue the study conversation.
`;

    const formattedHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const turn of history.slice(-12)) {
        if (turn && typeof turn.content === 'string' && turn.content.trim()) {
          formattedHistory.push({
            role: turn.role === 'assistant' || turn.role === 'model' ? 'model' : 'user',
            parts: [{ text: turn.content }],
          });
        }
      }
    }

    const enableSearch = Boolean(useSearchGrounding) || validRole === 'web_researcher';
    let selectedModel = 'gemini-3.1-flash-lite';
    const chatConfig: any = {
      systemInstruction,
    };

    if (enableSearch) {
      selectedModel = 'gemini-4-hydrogen';
      chatConfig.tools = [{ googleSearch: {} }];
    } else if (validRole === 'fast_coach' || validRole === 'examiner') {
      selectedModel = 'gemini-3.1-flash-lite';
    } else if (validRole === 'deep_reasoner') {
      selectedModel = 'gemini-4-hydrogen';
      chatConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    const { response, modelUsed } = await sendChatWithRetry({
      model: selectedModel,
      history: formattedHistory,
      message,
      config: chatConfig,
    });

    const reply = (response?.text || '').trim();
    if (!reply) {
      return res.status(502).json({
        error: 'The AI Tutor returned an empty response. Please click retry.',
      });
    }
    const groundingSources = extractGroundingSources(response);

    return res.json({
      reply,
      modelUsed,
      roleUsed: validRole,
      groundingSources,
    });
  } catch (err: any) {
    const formatted = formatGeminiError(err, 'The AI Tutor is temporarily busy. Please click retry.');
    if (formatted.status >= 500) {
      console.error('Tutor API Error:', formatted.message);
    }
    return res.status(formatted.status).json({ error: formatted.message });
  }
});

// ==========================================
// 2b. Live Syllabus & Exam Web Search (Google Search Grounding)
// ==========================================
app.post('/api/search/syllabus', checkQuota, async (req: Request, res: Response) => {
  try {
    const { query, curriculum = 'ECZ', subject = 'General' } = req.body;
    if (!query || typeof query !== 'string' || query.trim().length < 4) {
      return res.status(400).json({ error: 'Please enter a search question of at least 4 characters.' });
    }

    if (!isApiKeyConfigured) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is configured in Settings > Secrets.',
      });
    }

    const prompt = `Search for accurate, up-to-date information relevant to ${curriculum} (${subject}) students: "${query.trim()}". Summarize key verified facts clearly in bullet points and note any official circular or timetable dates found. Never claim official affiliation with ECZ or Cambridge International.`;

    let response: any;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
    } catch (firstErr: any) {
      if (isTransientCapacityError(firstErr)) {
        await new Promise((r) => setTimeout(r, 600));
        response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
      } else {
        throw firstErr;
      }
    }

    const answer = (response?.text || '').trim();
    if (!answer) {
      return res.status(502).json({
        error: 'Live web search returned no grounded summary for this query. Please retry.',
      });
    }
    const groundingSources = extractGroundingSources(response);
    return res.json({
      answer,
      groundingSources,
      modelUsed: 'gemini-4-hydrogen',
    });
  } catch (err: any) {
    const formatted = formatGeminiError(err, 'Failed to perform live web search. Please try again.');
    if (formatted.status >= 500) {
      console.error('Search Grounding Error:', formatted.message);
    }
    return res.status(formatted.status).json({ error: formatted.message });
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

    if (!isApiKeyConfigured) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

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

    const response = await callGeminiSafe({
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
            difficulty: { type: Type.STRING },
            keyConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
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

    const parsed = parseRequiredJson<any>(response?.text, 'Homework Scanner');

    return res.json({ result: parsed });
  } catch (err: any) {
    const formatted = formatGeminiError(
      err,
      'Failed to scan and analyze homework image. Please ensure the image is clear and retry.'
    );
    if (formatted.status >= 500) {
      console.error('Homework Scan Error:', formatted.message);
    }
    return res.status(formatted.status).json({ error: formatted.message });
  }
});

// ==========================================
// 4. Exam Practice Generator
// ==========================================
app.post('/api/practice/generate', checkQuota, async (req: Request, res: Response) => {
  try {
    const {
      curriculum = 'ECZ',
      grade = 'Grade 12',
      subject = 'Mathematics',
      topic = 'Algebra',
      count = 4,
      type = 'mixed',
    } = req.body;

    if (!isApiKeyConfigured) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const systemInstruction = `
You are an expert exam item writer for ${curriculum} (${grade}) in ${subject}.
Generate ${count} realistic, curriculum-aligned exam practice questions on the topic "${topic}".
Each question MUST be clearly categorized as "AI-Generated Exam Practice" (never claim it is an official leaked paper).
Format should match authentic exam conventions:
- For ECZ: Follow ECZ Paper 1 (non-calculator, foundational/structured) or Paper 2 (calculator, structured, graphing, multi-step).
- For ZambiaCBC: Follow Zambia's 2023 Competence-Based Curriculum — foundational & Term 1/Term 2 competence tasks for Forms 1–3, real-world scenario/application tasks for Form 4 O-Level pathways, or rigorous analytical/proof/multi-step problems for Forms 5–6 A-Level specializations.
- For Cambridge: Follow IGCSE Core/Extended (Papers 1/3 or 2/4) or Sciences (Paper 2 MCQ / Paper 4 Theory).
Include mark distribution [e.g., 2 marks, 3 marks, 4 marks] and detailed marking rubrics (Method M-marks, Accuracy A-marks).
`;

    const response = await callGeminiSafe({
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
              questionType: { type: Type.STRING },
              totalMarks: { type: Type.INTEGER },
              questionText: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctOptionIndex: {
                type: Type.INTEGER,
              },
              modelAnswer: { type: Type.STRING },
              markingScheme: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    markType: { type: Type.STRING },
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

    const questions = parseRequiredJson<any[]>(response?.text, 'Practice Generator');
    return res.json({ questions });
  } catch (err: any) {
    const formatted = formatGeminiError(err, 'Failed to generate practice questions. Please retry.');
    if (formatted.status >= 500) {
      console.error('Practice Generation Error:', formatted.message);
    }
    return res.status(formatted.status).json({ error: formatted.message });
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

    if (!isApiKeyConfigured) {
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

    const response = await callGeminiSafe({
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

    const evaluation = parseRequiredJson<any>(response?.text, 'Answer Marking');

    return res.json({ evaluation });
  } catch (err: any) {
    const formatted = formatGeminiError(err, 'Failed to grade answer. Please try again.');
    if (formatted.status >= 500) {
      console.error('Answer Marking Error:', formatted.message);
    }
    return res.status(formatted.status).json({ error: formatted.message });
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

    if (!isApiKeyConfigured) {
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

    const response = await callGeminiSafe({
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

    const cards = parseRequiredJson<any[]>(response?.text, 'Flashcard Generator');
    return res.json({ cards });
  } catch (err: any) {
    const formatted = formatGeminiError(err, 'Failed to generate flashcards. Please retry.');
    if (formatted.status >= 500) {
      console.error('Flashcard Generation Error:', formatted.message);
    }
    return res.status(formatted.status).json({ error: formatted.message });
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

    if (!isApiKeyConfigured) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

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

    const response = await callGeminiSafe({
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

    const summaryData = parseRequiredJson<any>(response?.text, 'Notes Summarizer');

    return res.json({ summary: summaryData });
  } catch (err: any) {
    const formatted = formatGeminiError(err, 'Failed to summarize notes. Please try again.');
    if (formatted.status >= 500) {
      console.error('Notes Summarize Error:', formatted.message);
    }
    return res.status(formatted.status).json({ error: formatted.message });
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

    if (!isApiKeyConfigured) {
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

    const response = await callGeminiSafe({
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
                  dayName: { type: Type.STRING },
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
                        activityType: { type: Type.STRING },
                        priority: { type: Type.STRING },
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

    const timetable = parseRequiredJson<any>(response?.text, 'Timetable Generator');

    return res.json({ timetable });
  } catch (err: any) {
    const formatted = formatGeminiError(err, 'Failed to generate timetable.');
    if (formatted.status >= 500) {
      console.error('Timetable Generation Error:', formatted.message);
    }
    return res.status(formatted.status).json({ error: formatted.message });
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

  const minPossibleSeconds = totalQuestions * 2;
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
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScholarSpark AI server running on http://0.0.0.0:${PORT} [${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
