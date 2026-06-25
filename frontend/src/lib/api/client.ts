const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const TOKEN_KEY    = 'myiu_token';
const PROVIDER_KEY = 'myiu_auth_provider';

const DEFAULT_TIMEOUT_MS = 15_000; // 15 s — fail fast, don't hang forever

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function setAuthProvider(provider: 'microsoft' | 'local'): void {
  localStorage.setItem(PROVIDER_KEY, provider);
}
export function getAuthProvider(): string | null {
  return localStorage.getItem(PROVIDER_KEY);
}
export function clearAuthProvider(): void {
  localStorage.removeItem(PROVIDER_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // AbortController — request times out after DEFAULT_TIMEOUT_MS.
  // Previously: no timeout → a slow server would hang the UI indefinitely.
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res  = await fetch(`${BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    const body = await res.json().catch(() => null);

    if (res.status === 401) {
      // Token expired or session revoked — force logout
      clearToken();
      clearAuthProvider();
      if (!window.location.pathname.startsWith('/sign-in')) {
        window.location.replace('/sign-in?reason=session_expired');
      }
      throw Object.assign(new Error('Session expired'), { status: 401 });
    }

    if (!res.ok) {
      const message = body?.message || `HTTP ${res.status}`;
      const err = Object.assign(new Error(message), { status: res.status, body });
      throw err;
    }
    return body?.data ?? body;
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new Error(`Request timed out after ${DEFAULT_TIMEOUT_MS / 1000}s`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function upload(path: string, file: File): Promise<string> {
  const token = getToken();
  const form = new FormData();
  form.append('file', file);

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 60_000); // uploads get 60 s

  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
      signal: controller.signal,
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`);
    return body?.data ?? body;
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw new Error('Upload timed out after 60s');
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  get:    <T>(path: string)                  => request<T>(path),
  post:   <T>(path: string, data?: unknown)  => request<T>(path, { method: 'POST',   body: data ? JSON.stringify(data) : undefined }),
  put:    <T>(path: string, data?: unknown)  => request<T>(path, { method: 'PUT',    body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string)                  => request<T>(path, { method: 'DELETE' }),
};

/** Normalize a Spring Boot entity to look like an Appwrite document. */
export function norm(obj: any): any {
  if (!obj) return obj;
  return {
    ...obj,
    $id:        obj.id        ?? obj.$id,
    $createdAt: obj.createdAt ?? obj.$createdAt,
    $updatedAt: obj.updatedAt ?? obj.$updatedAt,
  };
}

export function normList(list: any[]): any[] {
  return (list ?? []).map(norm);
}
