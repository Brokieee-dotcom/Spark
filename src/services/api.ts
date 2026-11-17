export interface ApiOptions {
  isPremium?: boolean;
  retries?: number;
}

const API_BASE_STORAGE_KEY = 'scholarspark_api_base_url';
const ENV_API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function getApiBaseUrl(): string {
  if (ENV_API_BASE) return ENV_API_BASE;
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(API_BASE_STORAGE_KEY) || '';
    return stored.trim().replace(/\/$/, '');
  }
  return '';
}

export function setCustomApiBaseUrl(url: string): void {
  if (typeof window === 'undefined') return;
  const cleaned = url.trim().replace(/\/$/, '');
  if (!cleaned) {
    window.localStorage.removeItem(API_BASE_STORAGE_KEY);
  } else {
    window.localStorage.setItem(API_BASE_STORAGE_KEY, cleaned);
  }
}

export async function checkBackendHealth(overrideUrl?: string): Promise<{
  ok: boolean;
  message: string;
}> {
  const base = (overrideUrl !== undefined ? overrideUrl : getApiBaseUrl()).replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/api/health`);
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      return {
        ok: false,
        message: 'Static host detected or /api/health unavailable. Set your Cloud Run backend URL to enable live AI.',
      };
    }
    const json = await res.json();
    return {
      ok: json.status === 'ok',
      message: json.apiKeyConfigured
        ? 'Connected to live Gemini AI backend.'
        : 'Backend reachable, but GEMINI_API_KEY is not configured on the server.',
    };
  } catch (err: any) {
    return {
      ok: false,
      message: err?.message || 'Unable to reach backend server.',
    };
  }
}

function buildUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  return `${getApiBaseUrl()}${endpoint}`;
}

export async function fetchQuotaStatus(): Promise<{
  tier: 'free' | 'premium';
  remaining: number;
  limit: number;
} | null> {
  try {
    const res = await fetch(buildUrl('/api/quota'));
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) return null;
    const data = await res.json();
    return {
      tier: data.tier === 'premium' ? 'premium' : 'free',
      remaining: typeof data.remaining === 'number' ? data.remaining : 50,
      limit: typeof data.limit === 'number' ? data.limit : 50,
    };
  } catch {
    return null;
  }
}

export async function requestApi<T>(
  endpoint: string,
  body: any,
  options?: ApiOptions
): Promise<{ data: T; quotaRemaining?: number; quotaLimit?: number }> {
  const maxRetries = options?.retries ?? 2;
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const res = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const remainingHeader = res.headers.get('X-Quota-Remaining');
      const limitHeader = res.headers.get('X-Quota-Limit');
      const quotaRemaining =
        remainingHeader && remainingHeader !== 'unlimited'
          ? parseInt(remainingHeader, 10)
          : undefined;
      const quotaLimit = limitHeader ? parseInt(limitHeader, 10) : undefined;

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        if (res.status === 404 || res.status === 405) {
          throw new Error(
            'AI backend endpoint is not connected on this static host. Configure VITE_API_BASE_URL to point to your Cloud Run backend.'
          );
        }
        throw new Error(`Unexpected response from server (HTTP ${res.status}).`);
      }

      let json: any;
      try {
        json = await res.json();
      } catch (_e) {
        throw new Error(`Server returned status ${res.status} with unreadable payload.`);
      }

      if (!res.ok) {
        // Retry transient capacity/rate-limit spikes
        if ((res.status === 503 || res.status === 429) && attempt < maxRetries && !json.quotaExceeded) {
          await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
          continue;
        }

        const errorMsg =
          json.error || `Server request failed with status ${res.status}`;
        const err = new Error(errorMsg);
        (err as any).status = res.status;
        (err as any).quotaExceeded = json.quotaExceeded;
        throw err;
      }

      return { data: json as T, quotaRemaining, quotaLimit };
    } catch (err: any) {
      lastError = err;
      if (
        attempt < maxRetries &&
        !(err as any).quotaExceeded &&
        err?.status !== 400 &&
        err?.status !== 404 &&
        err?.status !== 405
      ) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        continue;
      }
      throw lastError;
    }
  }

  throw lastError || new Error('Request could not be completed.');
}

export async function downloadVsCodeProjectBundle(): Promise<void> {
  const res = await fetch(buildUrl('/api/export/vscode-bundle'));
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || !contentType.includes('application/zip')) {
    if (res.status === 404 || !contentType.includes('application/zip')) {
      throw new Error(
        'VS Code ZIP export requires an active ScholarSpark backend server. If you are on GitHub Pages, download the repository ZIP from GitHub or connect your Cloud Run backend URL above.'
      );
    }
    throw new Error(`Export failed with HTTP ${res.status}.`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ScholarSpark-AI-VSCode.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

