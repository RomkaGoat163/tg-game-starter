import React, { useEffect, useMemo, useState } from 'react'

type TgWebApp = {
  initData: string
  initDataUnsafe?: any
  expand: () => void
  ready: () => void
  MainButton?: { text: string; show: () => void; onClick: (cb: () => void) => void }
}

declare global {
  interface Window {
    Telegram?: { WebApp: TgWebApp }
  }
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080'

export default function App() {
  const [status, setStatus] = useState('')
  const tg = window.Telegram?.WebApp

  const initData = useMemo(() => {
    return tg?.initData || ''
  }, [tg])

  useEffect(() => {
    tg?.ready()
    tg?.expand()

    async function auth() {
      try {
        const res = await fetch(`${SERVER_URL}/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData })
        })
        const data = await res.json()
        if (data.ok) {
          setStatus(`Готово: пользователь создан/вход выполнен. Баланс: ${data.balance}`)
        } else {
          setStatus(`Ошибка авторизации: ${data.error}`)
        }
      } catch (e) {
        setStatus('Сервер недоступен')
      }
    }

    if (initData) auth()
    else setStatus('Открой через Telegram, чтобы авторизоваться')

  }, [initData, tg])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <h1>🚀 Мини‑игра (MVP)</h1>
      <p>{status}</p>
      <p>
        Это заглушка WebApp. Здесь будет лобби/матчмейкинг и сама игра. Пока — проверка initData и
        создание пользователя на сервере.
      </p>
    </div>
  )
}
