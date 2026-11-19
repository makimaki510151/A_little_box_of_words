import { useRef } from 'react'
import { useGame } from '../game/GameContext'
import type { SettingsState } from '../types/game'

export function SettingsPanel() {
  const { state, updateSettings, resetGame, exportData, importData } = useGame()
  const fileRef = useRef<HTMLInputElement>(null)
  const s = state.settings

  const set = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    updateSettings({ [key]: value })
  }

  const download = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `little-box-of-words-save.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImportFile = async (file: File | null) => {
    if (!file) return
    const text = await file.text()
    importData(text)
  }

  return (
    <div>
      <h2 className="panel-title">設定</h2>
      <p className="panel-desc">
        セーブはブラウザの LocalStorage に保存されます。ブラウザデータを消すと消失します。
      </p>

      <div className="settings-grid">
        <div className="setting-row">
          <label htmlFor="bgm">BGM音量（準備中） {Math.round(s.bgmVolume * 100)}%</label>
          <input
            id="bgm"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={s.bgmVolume}
            onChange={(e) => set('bgmVolume', Number(e.target.value))}
          />
        </div>

        <div className="setting-row">
          <label htmlFor="sfx">効果音音量（準備中） {Math.round(s.sfxVolume * 100)}%</label>
          <input
            id="sfx"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={s.sfxVolume}
            onChange={(e) => set('sfxVolume', Number(e.target.value))}
          />
        </div>

        <div className="setting-row">
          <label htmlFor="anim">アニメーション</label>
          <select
            id="anim"
            value={s.animations ? 'on' : 'off'}
            onChange={(e) => set('animations', e.target.value === 'on')}
          >
            <option value="on">ON</option>
            <option value="off">OFF</option>
          </select>
        </div>

        <div className="setting-row">
          <label htmlFor="fontSize">文字サイズ</label>
          <select
            id="fontSize"
            value={s.fontSize}
            onChange={(e) => set('fontSize', e.target.value as SettingsState['fontSize'])}
          >
            <option value="small">小</option>
            <option value="medium">中</option>
            <option value="large">大</option>
          </select>
        </div>

        <div className="setting-row">
          <label htmlFor="scale">表示倍率 {s.scale.toFixed(2)}</label>
          <input
            id="scale"
            type="range"
            min={0.85}
            max={1.15}
            step={0.05}
            value={s.scale}
            onChange={(e) => set('scale', Number(e.target.value))}
          />
        </div>

        <div className="setting-row">
          <label htmlFor="theme">配色</label>
          <select
            id="theme"
            value={s.colorTheme}
            onChange={(e) => set('colorTheme', e.target.value as SettingsState['colorTheme'])}
          >
            <option value="ink">インク夜</option>
            <option value="dawn">夜明け</option>
            <option value="forest">深緑</option>
          </select>
        </div>

        <div className="typing-actions">
          <button type="button" className="btn btn-ghost" onClick={download}>
            セーブを書き出し
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            セーブを読み込み
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => onImportFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="typing-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              if (window.confirm('セーブデータを削除して最初から始めますか？')) {
                resetGame()
              }
            }}
          >
            データを初期化
          </button>
        </div>
      </div>
    </div>
  )
}
