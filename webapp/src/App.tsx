import { useEffect, useState } from 'react';
import { postJSON } from './Api';
import { webAppReady, getInitData } from './telegram';

type VerifyResponse = {
  ok: boolean;
  error?: string;
  user?: { id: string; username?: string };
  balance?: number;
};

export default function App() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    webAppReady();
    const initData = getInitData();

    if (!initData) {
      setMessage('Открой это приложение через Telegram, чтобы авторизоваться.');
      return;
    }

    (async () => {
      try {
        setStatus('checking');
        const res = await postJSON<VerifyResponse>('/auth/verify', { initData });
        if (res.ok) {
          setStatus('ok');
          setMessage(`Готово! Привет, ${res.user?.username || 'игрок'} — баланс: ${res.balance ?? 0}`);
        } else {
          setStatus('error');
          setMessage(res.error || 'Ошибка авторизации');
        }
      } catch (e: any) {
        setStatus('error');
        setMessage(e.message);
      }
    })();
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial' }}>
      <h1>Мини-игра (MVP)</h1>
      <p>Это заглушка WebApp. Здесь будет лобби/матчмейкинг и сама игра. Первым шагом проверяем подпись Telegram (initData) на сервере.</p>
      <hr />
      <p><b>Статус:</b> {status}</p>
      <p><b>Сообщение:</b> {message}</p>
    </main>
  );
}
