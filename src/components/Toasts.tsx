import { useEffect } from 'react'
import { useGame } from '../game/GameContext'

export function Toasts() {
  const { toasts, dismissToast } = useGame()

  useEffect(() => {
    if (toasts.length === 0) return
    const latest = toasts[toasts.length - 1]
    const timer = window.setTimeout(() => dismissToast(latest.id), 3200)
    return () => window.clearTimeout(timer)
  }, [toasts, dismissToast])

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`toast ${t.kind}`}
          onClick={() => dismissToast(t.id)}
        >
          {t.message}
        </button>
      ))}
    </div>
  )
}
