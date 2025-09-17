import React, { useEffect, useState } from 'react';

type Status = 'idle' | 'loading' | 'done' | 'error';

export default function App() {
  const [status, setStatus] = useState<Status>('idle');
  const [msg, setMsg] = useState<string>('Открой через Telegram, чтобы авторизоваться.');

  useEffect(() => {
    // Поймаем любые JS-ошибки и выведем на экран
    const onErr = (e: any) => setMsg(`JS error: ${e?.message || e}`);
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', (e: any) => onErr(e?.reason));
    return () => {
      window.removeEventListener('error', onErr);
      window.removeEventListener('unhandledrejection', onErr);
    };
  }, []);

  return (
    <div className="container">
      <h1>Мини-игра (MVP)</h1>
      <hr />
      <p><b>Статус:</b> {status}</p>
      <p><b>Сообщение:</b> {msg}</p>
      <div className="card">
        <small className="hint">
          Если видишь это за пределами Telegram — это нормально. Открой бота и жми кнопку меню.
        </small>
      </div>
    </div>
  );
}