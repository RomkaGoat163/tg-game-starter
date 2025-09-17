export const API_URL: string =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080';

async function request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function postJSON<T>(path: string, body: unknown): Promise<T> {
  return request<T>('POST', path, body);
}
