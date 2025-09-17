export function webAppReady() {
  const tg = (window as any).Telegram?.WebApp;
  if (tg) tg.ready();
}

export function getInitData(): string | null {
  const tg = (window as any).Telegram?.WebApp;
  return tg?.initData || null;
}

export function parseUserFromInitData(initData: string) {
  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}
