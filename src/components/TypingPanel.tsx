import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { CATEGORY_LABELS } from '../game/constants'
import { formatResourceGain } from '../game/resources'
import { useGame } from '../game/GameContext'

export function TypingPanel() {
  const { currentPhrase, submitTyping, lastResult, state } = useGame()
  const [typed, setTyped] = useState('')
  const [misses, setMisses] = useState(0)
  const startedAt = useRef<number | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setTyped('')
    setMisses(0)
    startedAt.current = null
    inputRef.current?.focus()
  }, [currentPhrase.id])

  const chars = useMemo(() => {
    const target = currentPhrase.text
    return target.split('').map((ch, i) => {
      if (i >= typed.length) {
        return { ch, status: i === typed.length ? 'current' : 'todo' as const }
      }
      return { ch, status: typed[i] === ch ? 'ok' : 'bad' }
    })
  }, [currentPhrase.text, typed])

  const onChange = (value: string) => {
    if (!startedAt.current && value.length > 0) {
      startedAt.current = Date.now()
    }

    // 増えた文字が目標と違う場合はミスとして数える
    if (value.length > typed.length) {
      const idx = typed.length
      const added = value.slice(typed.length)
      for (let i = 0; i < added.length; i += 1) {
        const targetChar = currentPhrase.text[idx + i]
        if (targetChar !== undefined && added[i] !== targetChar) {
          setMisses((m) => m + 1)
        }
      }
    }
    setTyped(value)
  }

  const finish = () => {
    if (!typed.trim()) return
    submitTyping(typed, misses, startedAt.current ?? Date.now())
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      finish()
    }
  }

  return (
    <div>
      <h2 className="panel-title">タイピング</h2>
      <p className="panel-desc">
        表示された言葉を入力して資源を集めます。正確さが報酬の中心で、速さは追加ボーナスです。
      </p>

      <div className="typing-prompt">
        <div className="prompt-meta">
          <span>{CATEGORY_LABELS[currentPhrase.category]} · 難易度 {currentPhrase.difficulty}</span>
          <span>Enter で確定</span>
        </div>
        <div className="prompt-text" aria-live="polite">
          {chars.map((c, i) => (
            <span key={`${currentPhrase.id}-${i}`} className={c.status}>
              {c.ch}
            </span>
          ))}
        </div>
      </div>

      <label className="sr-only" htmlFor="typing-input">
        入力欄
      </label>
      <textarea
        id="typing-input"
        ref={inputRef}
        className="typing-input"
        value={typed}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="ここに入力…"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        rows={2}
      />

      <div className="typing-actions">
        <button type="button" className="btn btn-primary" onClick={finish} disabled={!typed.trim()}>
          入力を確定
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setTyped('')
            setMisses(0)
            startedAt.current = null
            inputRef.current?.focus()
          }}
        >
          クリア
        </button>
      </div>

      <div className="stat-row">
        <span className="stat-pill">
          コンボ{' '}
          <strong key={state.combo} className={state.combo > 0 ? 'combo-pop' : undefined}>
            {state.combo}
          </strong>
        </span>
        <span className="stat-pill">
          ミス <strong>{misses}</strong>
        </span>
        <span className="stat-pill">
          通算 <strong>{state.stats.typingCount}</strong> 回
        </span>
      </div>

      {lastResult && (
        <div className="result-banner">
          正確性 {(lastResult.accuracy * 100).toFixed(0)}% · 速度{' '}
          {lastResult.cps.toFixed(1)} 字/秒 · {formatResourceGain(lastResult.reward)}
          {lastResult.perfect ? ' · Perfect!' : ''}
        </div>
      )}
    </div>
  )
}
