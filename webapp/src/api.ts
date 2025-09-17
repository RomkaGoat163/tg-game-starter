const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
console.log('API_BASE =', base); // <— временно, для проверки

export async function postJSON<T = any>(path: string, body: any, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
