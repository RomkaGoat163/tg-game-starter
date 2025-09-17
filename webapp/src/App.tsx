import { useEffect, useState } from 'react';
import { postJSON } from './api';
import { getInitData, webAppReady } from './telegram';

type VerifyResponse =
  | { ok: true; user: { id: string; username: string | null }; balance: number }
  | { ok: false; error: string };

export default function App() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [user, setUser] = useState<{ id: string; username: string | null } | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    webAppReady(); // Помечаем WebApp готовым (если реально в TG)

    // Пытаемся сразу авторизоваться, если зашли из Telegram
    const initData = getInitData();
    if (!initData) {
      setStatus('idle');
      setMessage('Открой это приложение через Telegram, чтобы авторизоваться.');
      return;
    }

    (async () => {
      try {
        setStatus('checking');
        setMessage('Проверяем подпись Telegram…');

        const res = await postJSON<VerifyResponse>('/auth/verify', { initData });

        if (res.ok) {
          setUser(res.user);
          setBalance(res.balance);
          setStatus('done');
          setMessage('Авторизация успешна ✅');
        } else {
          setStatus('error');
          setMessage(`Ошибка авторизации: ${res.error}`);
        }
      } catch (e: any) {
        setStatus('error');
        setMessage(e?.message || 'SERVER_ERROR');
      }
    })();
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui, Arial' }}>
      <h1>Мини-игра (MVP)</h1>

      <p>
        Это заглушка WebApp. Здесь будет лобби/матчмейкинг и сама игра. Первым шагом
        мы проверяем подпись Telegram (initData) на сервере и создаём пользователя.
      </p>

      <hr />

      <p><strong>Статус:</strong> {status}</p>
      <p><strong>Сообщение:</strong> {message}</p>

      {status === 'idle' && (
        <p style={{ color: '#777' }}>
          Если видишь это вне Telegram — это нормально. Открой бота и жми кнопку «Открыть мини-игру».
        </p>
      )}

      {status === 'done' && user && (
        <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
          <p><strong>Пользователь:</strong> {user.username || '(без username)'}</p>
          <p><strong>Баланс:</strong> {balance}</p>
        </div>
      )}
    </div>
  );
}
