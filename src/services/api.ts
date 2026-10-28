export interface ApiOptions {
  isPremium?: boolean;
}

export async function requestApi<T>(
  endpoint: string,
  body: any,
  options?: ApiOptions
): Promise<{ data: T; quotaRemaining?: number }> {
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
  const quotaRemaining = remainingHeader && remainingHeader !== 'unlimited' ? parseInt(remainingHeader, 10) : undefined;

  let json: any;
  try {
    json = await res.json();
  } catch (_e) {
    throw new Error(`Server returned status ${res.status} with invalid JSON response.`);
  }

  if (!res.ok) {
    const errorMsg = json.error || `Server request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    (err as any).status = res.status;
    (err as any).quotaExceeded = json.quotaExceeded;
    throw err;
  }

  return { data: json as T, quotaRemaining };
}
