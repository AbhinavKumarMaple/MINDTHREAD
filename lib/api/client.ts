export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// A 401 from an authenticated endpoint means the session is gone or stale
// (e.g. the user it pointed at was deleted). The server has already cleared the
// cookie; bounce to /login so the user re-authenticates instead of getting
// stuck on a half-broken page. Auth endpoints handle their own 401s (a wrong
// password is a 401 too), and we never redirect away from the auth pages.
function handleUnauthorized(path: string): void {
  if (typeof window === 'undefined') return;
  if (path.startsWith('/api/auth/')) return;
  const here = window.location.pathname;
  if (here === '/login' || here === '/signup') return;
  window.location.replace('/login');
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  const isJson = res.headers
    .get('content-type')
    ?.includes('application/json');
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    if (res.status === 401) handleUnauthorized(path);
    throw new ApiError(
      data?.error ?? 'Request failed',
      res.status,
      data?.code,
    );
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  del: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};
