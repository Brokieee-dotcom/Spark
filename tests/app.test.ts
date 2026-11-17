import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import JSZip from 'jszip';
import { app, parseSafeJson } from '../server.ts';
import {
  CURRICULA_DATA,
  SAMPLE_PRACTICE_QUESTIONS,
  DEFAULT_EXAM_DATES,
  ZAMBIAN_PRIVATE_SCHOOLS,
} from '../src/data/curriculums.ts';

let server: http.Server;
let baseUrl = '';

before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (addr && typeof addr !== 'string') {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

test('GET /api/health returns service status without leaking secrets', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'ok');
  assert.ok(Array.isArray(body.curriculumsSupported));
  assert.equal('GEMINI_API_KEY' in body, false);
});

test('GET /api/quota returns server-enforced free tier allowance', async () => {
  const res = await fetch(`${baseUrl}/api/quota`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.tier, 'free');
  assert.equal(body.limit, 50);
  assert.equal(typeof body.remaining, 'number');
});

test('POST /api/tutor validates missing message and ignores client premium spoofing headers', async () => {
  const res = await fetch(`${baseUrl}/api/tutor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Spark-Tier': 'premium',
    },
    body: JSON.stringify({ curriculum: 'ECZ', subject: 'Mathematics' }),
  });
  assert.equal(res.status, 400);
  assert.equal(res.headers.get('x-quota-tier'), 'free');
  assert.equal(res.headers.get('x-quota-limit'), '50');
  const body = await res.json();
  assert.match(body.error, /question or message is required/i);
});

test('POST /api/homework/scan rejects empty image payload', async () => {
  const res = await fetch(`${baseUrl}/api/homework/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ curriculum: 'Cambridge', subject: 'Physics' }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /no image data/i);
});

test('POST /api/notes/summarize rejects notes shorter than 20 characters', async () => {
  const res = await fetch(`${baseUrl}/api/notes/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Too short', curriculum: 'ECZ', subject: 'Biology' }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /at least 20 characters/i);
});

test('POST /api/practice/mark rejects missing question or answer', async () => {
  const res = await fetch(`${baseUrl}/api/practice/mark`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionText: 'Solve 2x = 6' }),
  });
  assert.equal(res.status, 400);
});

test('POST /api/challenge/submit enforces server-side anti-tamper speed check', async () => {
  const tamperedRes = await fetch(`${baseUrl}/api/challenge/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      challengeId: 'chal-test-1',
      completedQuestions: 5,
      totalQuestions: 5,
      elapsedSeconds: 2,
    }),
  });
  assert.equal(tamperedRes.status, 400);
  const tamperedBody = await tamperedRes.json();
  assert.equal(tamperedBody.tampered, true);

  const validRes = await fetch(`${baseUrl}/api/challenge/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      challengeId: 'chal-test-2',
      completedQuestions: 4,
      totalQuestions: 5,
      elapsedSeconds: 45,
    }),
  });
  assert.equal(validRes.status, 200);
  const validBody = await validRes.json();
  assert.equal(validBody.verified, true);
  assert.equal(validBody.accuracy, 80);
  assert.equal(validBody.score, 4 * 100 + (300 - 45));
});

test('parseSafeJson handles fenced JSON and malformed strings safely', () => {
  const fenced = '```json\n{"ok":true,"count":3}\n```';
  assert.deepEqual(parseSafeJson(fenced, { ok: false, count: 0 }), { ok: true, count: 3 });

  const malformed = '{bad json';
  assert.deepEqual(parseSafeJson(malformed, { fallback: true }), { fallback: true });
});

test('ECZ, ZambiaCBC (Forms 1-6), and Cambridge IGCSE curricula, Zambian private schools, and Term 1/2 assessments are configured properly', () => {
  assert.notEqual(CURRICULA_DATA.ECZ.fullName, CURRICULA_DATA.Cambridge.fullName);
  assert.notEqual(CURRICULA_DATA.ZambiaCBC.fullName, CURRICULA_DATA.ECZ.fullName);
  assert.ok(CURRICULA_DATA.ECZ.grades.includes('Grade 12'));
  assert.ok(CURRICULA_DATA.ZambiaCBC.grades.includes('Form 1 (O-Level)'));
  assert.ok(CURRICULA_DATA.ZambiaCBC.grades.includes('Form 2 (O-Level)'));
  assert.ok(CURRICULA_DATA.ZambiaCBC.grades.includes('Form 3 (O-Level)'));
  assert.ok(CURRICULA_DATA.ZambiaCBC.grades.includes('Form 4 (O-Level)'));
  assert.ok(CURRICULA_DATA.ZambiaCBC.grades.includes('Form 5 (A-Level)'));
  assert.ok(CURRICULA_DATA.ZambiaCBC.grades.includes('Form 6 (A-Level)'));
  assert.ok(CURRICULA_DATA.Cambridge.grades.includes('IGCSE Extended'));
  assert.equal(CURRICULA_DATA.Cambridge.grades.includes('Grade 12'), false);
  assert.equal(CURRICULA_DATA.Cambridge.grades.includes('Form 5 (A-Level)'), false);

  // Real Zambian private schools
  assert.ok(ZAMBIAN_PRIVATE_SCHOOLS.includes('Rhodes Park School (Lusaka)'));
  assert.ok(ZAMBIAN_PRIVATE_SCHOOLS.includes('Baobab College (Lusaka)'));
  assert.ok(ZAMBIAN_PRIVATE_SCHOOLS.length >= 8);

  // Term 1 & Term 2 assessments (for Forms 1-3 instead of final exam day counter)
  const termAssessments = DEFAULT_EXAM_DATES.filter((d) => d.assessmentKind === 'term_assessment');
  assert.equal(termAssessments.length, 2);
  assert.ok(termAssessments.some((t) => t.term === 'Term 1'));
  assert.ok(termAssessments.some((t) => t.term === 'Term 2'));

  for (const q of SAMPLE_PRACTICE_QUESTIONS) {
    assert.ok(q.provenanceLabel && q.provenanceLabel.length > 0);
  }
});

test('GET /api/export/vscode-bundle returns valid VS Code project ZIP without secrets or node_modules', async () => {
  const res = await fetch(`${baseUrl}/api/export/vscode-bundle`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type') || '', /application\/zip/);
  const buf = await res.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);
  const paths = Object.keys(zip.files);

  assert.ok(paths.includes('ScholarSpark-AI/package.json'));
  assert.ok(paths.includes('ScholarSpark-AI/server.ts'));
  assert.ok(paths.includes('ScholarSpark-AI/src/App.tsx'));
  assert.ok(paths.includes('ScholarSpark-AI/.vscode/launch.json'));
  assert.ok(paths.includes('ScholarSpark-AI/scripts/ensure-deps.mjs'));
  assert.ok(paths.includes('ScholarSpark-AI/VSCODE_SETUP.md'));
  assert.equal(paths.some((p) => p.includes('node_modules')), false);
  assert.equal(paths.some((p) => p.endsWith('/.env')), false);
});

test('POST /api/search/syllabus validates query length for Google Search grounding', async () => {
  const res = await fetch(`${baseUrl}/api/search/syllabus`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'hi', curriculum: 'ECZ', subject: 'Mathematics' }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /at least 4 characters/i);
});

test('POST /api/tutor rejects missing message even with tutorRole and search grounding flags', async () => {
  const res = await fetch(`${baseUrl}/api/tutor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      curriculum: 'Cambridge',
      subject: 'Physics',
      tutorRole: 'web_researcher',
      useSearchGrounding: true,
      history: [{ role: 'user', content: 'Previous turn' }],
    }),
  });
  assert.equal(res.status, 400);
});


