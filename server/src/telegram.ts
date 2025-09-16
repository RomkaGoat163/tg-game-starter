import crypto from 'crypto';

/**
 * Проверяет подпись Telegram WebApp initData
 */
export function verifyInitData(initData: string, botToken: string): boolean {
  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const parsed = new URLSearchParams(initData);
  const hash = parsed.get('hash');
  if (!hash) return false;
  parsed.delete('hash');

  const dataCheckString = Array.from(parsed.entries())
    .sort(([a],[b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const hmac = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  return hmac === hash;
}

/**
 * Достаёт user из initData (если есть)
 */
export function parseUserFromInitData(initData: string) {
  const parsed = new URLSearchParams(initData);
  const userStr = parsed.get('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}
