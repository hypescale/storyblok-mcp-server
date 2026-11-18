import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// config.ts validates env at import time, so set it before loading the module.
process.env.STORYBLOK_SPACE_ID = '12345';
process.env.STORYBLOK_MANAGEMENT_TOKEN = 'test-token';
process.env.STORYBLOK_REGION = 'us';

const api = await import('./api.js');
const { createErrorResponse } = await import('./response.js');

type FetchCall = { url: string; init: RequestInit };
let calls: FetchCall[] = [];
let queue: Array<() => Response> = [];
const realFetch = globalThis.fetch;
const realSleep = api.sleep.fn;
const sleeps: number[] = [];

beforeEach(() => {
  calls = [];
  queue = [];
  sleeps.length = 0;
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const next = queue.shift();
    if (!next) throw new Error('Unexpected fetch');
    return next();
  }) as typeof fetch;
  api.sleep.fn = async (ms: number) => {
    sleeps.push(ms);
  };
});

afterEach(() => {
  globalThis.fetch = realFetch;
  api.sleep.fn = realSleep;
});

test('uses the regional base URL and Authorization header (no token in URL)', async () => {
  queue.push(() => Response.json({ stories: [] }));
  await api.apiGet('/stories', { page: '1' });
  assert.equal(calls[0]!.url, 'https://api-us.storyblok.com/v1/spaces/12345/stories?page=1');
  assert.equal((calls[0]!.init.headers as Record<string, string>).Authorization, 'test-token');
  assert.ok(!calls[0]!.url.includes('test-token'));
});

test('retries on 429 and then succeeds', async () => {
  queue.push(
    () => new Response('slow down', { status: 429 }),
    () => new Response('slow down', { status: 429, headers: { 'Retry-After': '2' } }),
    () => Response.json({ ok: true })
  );
  const data = await api.apiGet<{ ok: boolean }>('/stories');
  assert.deepEqual(data, { ok: true });
  assert.equal(calls.length, 3);
  assert.equal(sleeps.length, 2);
  assert.equal(sleeps[1], 2000, 'Retry-After seconds are honored');
});

test('gives up after maxRetries and throws APIError 429', async () => {
  for (let i = 0; i <= api.DEFAULT_RETRY.maxRetries; i++) {
    queue.push(() => new Response('{}', { status: 429 }));
  }
  await assert.rejects(api.apiGet('/stories'), (err: unknown) => {
    assert.ok(err instanceof api.APIError);
    assert.equal(err.statusCode, 429);
    return true;
  });
  assert.equal(calls.length, api.DEFAULT_RETRY.maxRetries + 1);
});

test('treats 200 with empty body as success (e.g. DELETE / tag update)', async () => {
  queue.push(() => new Response('', { status: 200 }));
  assert.deepEqual(await api.apiDelete('/tags/foo'), {});
});

test('treats 204 as success', async () => {
  queue.push(() => new Response(null, { status: 204 }));
  assert.deepEqual(await api.apiDelete('/stories/1'), {});
});

test('non-2xx throws APIError with details and suggested fix', async () => {
  queue.push(() => Response.json({ error: 'nope' }, { status: 404, statusText: 'Not Found' }));
  const err = await api.apiGet('/stories/999').catch((e: unknown) => e);
  assert.ok(err instanceof api.APIError);
  assert.equal(err.statusCode, 404);
  assert.deepEqual(err.details, { error: 'nope' });
  const res = createErrorResponse(err);
  assert.equal(res.isError, true);
  assert.match(res.content[0]!.text, /Suggested fix: .*STORYBLOK_REGION/);
});

test('apiGetPaginated exposes the Total header', async () => {
  queue.push(() => Response.json({ stories: [{}, {}] }, { headers: { Total: '42', 'Per-Page': '2' } }));
  const res = await api.apiGetPaginated('/stories');
  assert.equal(res.total, 42);
  assert.equal(res.perPage, 2);
});

test('computeRetryDelay grows exponentially and is capped', () => {
  const opts = { maxRetries: 5, baseDelayMs: 100, maxDelayMs: 1000 };
  const d0 = api.computeRetryDelay(0, null, opts);
  const d3 = api.computeRetryDelay(3, null, opts);
  assert.ok(d0 >= 100 && d0 < 200);
  assert.ok(d3 >= 800 && d3 <= 1000);
  assert.equal(api.computeRetryDelay(10, null, opts), 1000);
  assert.equal(api.computeRetryDelay(0, '60', opts), 1000, 'Retry-After is capped too');
});

test('buildUrlWithParams appends to URLs that already have a query', () => {
  assert.equal(api.buildUrlWithParams('https://x/y?a=1', { b: '2' }), 'https://x/y?a=1&b=2');
  assert.equal(api.buildUrlWithParams('https://x/y', {}), 'https://x/y');
});
