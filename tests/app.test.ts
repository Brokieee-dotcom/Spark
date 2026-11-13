import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app, parseSafeJson } from '../server.ts';
import { CURRICULA_DATA, SAMPLE_PRACTICE_QUESTIONS } from '../src/data/curriculums.ts';

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

test('POST /api/tutor validates missing message and sets free quota headers', async () => {
  const res = await fetch(`${baseUrl}/api/tutor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ curriculum: 'ECZ', subject: 'Mathematics' }),
  });
  assert.equal(res.status, 400);
  assert.equal(res.headers.get('x-quota-tier'), 'free');
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

test('ECZ and Cambridge IGCSE curricula remain distinct with provenance labels', () => {
  assert.notEqual(CURRICULA_DATA.ECZ.fullName, CURRICULA_DATA.Cambridge.fullName);
  assert.ok(CURRICULA_DATA.ECZ.grades.includes('Grade 12'));
  assert.ok(CURRICULA_DATA.Cambridge.grades.includes('IGCSE Extended'));
  assert.equal(CURRICULA_DATA.Cambridge.grades.includes('Grade 12'), false);

  for (const q of SAMPLE_PRACTICE_QUESTIONS) {
    assert.ok(q.provenanceLabel && q.provenanceLabel.length > 0);
  }
});
