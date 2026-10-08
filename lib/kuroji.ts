const DEFAULT_API_URL = "http://[2a11:6c7:1105:1907::166]:3000";

export function apiBase(): string {
  return (process.env.KUROJI_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");
}

export function adminKey(): string {
  return process.env.ADMIN_KEY || "";
}

export async function kurojiFetch(path: string, init?: RequestInit, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(apiBase() + path, {
      ...init,
      signal: ctrl.signal,
      headers: { "x-api-key": adminKey(), ...(init?.headers || {}) },
    });
    return res;
  } finally {
    clearTimeout(t);
  }
}
