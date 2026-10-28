export interface ApiOptions {
  isPremium?: boolean;
  retries?: number;
}

export async function requestApi<T>(
  endpoint: string,
  body: any,
  options?: ApiOptions
): Promise<{ data: T; quotaRemaining?: number }> {
  const maxRetries = options?.retries ?? 2;
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (options?.isPremium) {
        headers['X-Spark-Tier'] = 'premium';
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const remainingHeader = res.headers.get('X-Quota-Remaining');
      const quotaRemaining =
        remainingHeader && remainingHeader !== 'unlimited'
          ? parseInt(remainingHeader, 10)
          : undefined;

      let json: any;
      try {
        json = await res.json();
      } catch (_e) {
        throw new Error(`Server returned status ${res.status} with unreadable payload.`);
      }

      if (!res.ok) {
        // If 503 (high demand) or 504/429 and we have retries left, wait briefly and retry
        if ((res.status === 503 || res.status === 429) && attempt < maxRetries) {
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

      return { data: json as T, quotaRemaining };
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        continue;
      }
      throw lastError;
    }
  }

  throw lastError || new Error('Request could not be completed.');
}
