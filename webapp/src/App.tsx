import React, { useEffect, useState } from 'react';
import { postJSON } from './api'; // если у тебя есть эта функция; см. ниже примечание

type Phase = 'idle' | 'loading' | 'done' | 'error';

export default function App() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [msg, setMsg] = useState('Открой через Telegram, чтобы авторизоваться.');
  const [username, setUsername] = useState<string | undefined>();
  const [balance, setBalance] = useState<number | undefined>();

  useEffect(() => {
    const run = async () => {
      try {
        const tg = (window as any).Telegram?.WebApp;
        if (!tg) {
          setPhase('error');
          setMsg('Telegram.WebApp недоступен — открой из Telegram.');
          return;
        }

        tg.ready?.();
        tg.expand?.();

        const initData: string | undefined = tg.initData;
        if (!initData) {
          setPhase('error');
          setMsg('initData пустой — открой из Telegram.');
          return;
        }

        setPhase('loading');
        setMsg('Проверяем подпись…');

        const res = await postJSON('/auth/verify', { initData }); // см. примечание ниже
        if (!res?.ok) {
          throw new Error(res?.error || 'Auth failed');
        }

        setUsername(res.user?.username ?? String(res.user?.id ?? ''));
        setBalance(res.balance);
        setPhase('done');
        setMsg('Авторизация успешна ✅');
      } catch (e: any) {
        setPhase('error');
        setMsg(e?.message || String(e));
      }
    };

    run();
  }, []);

  return (
    <div className="container">
      <h1>Мини-игра (MVP)</h1>
      <hr />
      <p><b>Статус:</b> {phase}</p>
      <p><b>Сообщение:</b> {msg}</p>

      {(username || balance !== undefined) && (
        <div className="card">
          {username && <p><b>Пользователь:</b> {username}</p>}
          {balance !== undefined && <p><b>Баланс:</b> {balance}</p>}
        </div>
      )}

      <small className="hint">
        Если видишь это вне Telegram — это нормально. Открой бота и жми кнопку меню.
      </small>
    </div>
  );
}