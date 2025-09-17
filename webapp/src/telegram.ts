// Минимальные типы, чтобы TS не ругался
type TelegramWebApp = {
  initData?: string;
  ready?: () => void;
  expand?: () => void;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function getInitData(): string {
  return window?.Telegram?.WebApp?.initData || '';
}

export function webAppReady() {
  try {
    window?.Telegram?.WebApp?.ready?.();
    window?.Telegram?.WebApp?.expand?.();
  } catch {}
}
