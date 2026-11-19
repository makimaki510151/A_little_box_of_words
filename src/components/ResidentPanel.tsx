import { useState } from 'react'
import { describeUnlock, isUnlocked } from '../game/unlocks'
import { useGame } from '../game/GameContext'

export function ResidentPanel() {
  const { state, residents } = useGame()
  const [openId, setOpenId] = useState<string | null>(
    state.unlockedResidents[0] ?? null,
  )

  return (
    <div>
      <h2 className="panel-title">住人</h2>
      <p className="panel-desc">
        世界の発展に応じて住人が現れ、生産を助け、物語を運んできます。
      </p>

      <div className="list">
        {residents.map((r) => {
          const unlocked = state.unlockedResidents.includes(r.id)
          const canSee = unlocked || isUnlocked(state, r.unlockCondition)
          return (
            <article key={r.id} className={`list-item ${unlocked ? '' : 'locked'}`}>
              <div className="list-item-header">
                <h3>
                  {unlocked ? r.name : '？？？'}
                  <span style={{ marginLeft: '0.4rem', color: 'var(--ink-mute)', fontSize: '0.8rem' }}>
                    {unlocked ? r.title : '未登場'}
                  </span>
                </h3>
              </div>
              <p>{unlocked ? r.description : describeUnlock(r.unlockCondition)}</p>
              {unlocked && (
                <>
                  <p style={{ color: 'var(--accent)', fontSize: '0.82rem', marginTop: 0 }}>
                    効果：{r.effectDescription}
                  </p>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setOpenId(openId === r.id ? null : r.id)}
                  >
                    {openId === r.id ? '会話を閉じる' : '会話を聞く'}
                  </button>
                  {openId === r.id && (
                    <div className="dialogue" style={{ marginTop: '0.7rem' }}>
                      {r.dialogues.map((line, i) => (
                        <div key={`${r.id}-${i}`} className="dialogue-line">
                          <span className="speaker">{line.speaker}</span>
                          {line.text}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {!unlocked && canSee && (
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-mute)', margin: 0 }}>
                  登場条件を満たすと姿を現します。
                </p>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
