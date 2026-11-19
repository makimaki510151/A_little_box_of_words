import { useGame } from '../game/GameContext'

export function AchievementPanel() {
  const { state, achievements, claimAchievement } = useGame()

  return (
    <div>
      <h2 className="panel-title">実績</h2>
      <p className="panel-desc">行動と進行に応じて実績が解放されます。報酬は一度だけ受け取れます。</p>

      <div className="list">
        {achievements.map((a) => {
          const unlocked = state.unlockedAchievements.includes(a.id)
          const claimed = state.claimedAchievementRewards.includes(a.id)
          return (
            <article key={a.id} className={`list-item ${unlocked ? '' : 'locked'}`}>
              <div className="list-item-header">
                <h3>{unlocked ? a.name : '？？？'}</h3>
                {unlocked && !claimed && <span className="badge">報酬あり</span>}
                {claimed && <span className="badge">受取済</span>}
              </div>
              <p>{a.description}</p>
              {unlocked && a.reward && !claimed && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => claimAchievement(a.id)}
                >
                  報酬を受け取る
                </button>
              )}
              {!unlocked && (
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--ink-mute)' }}>
                  まだ達成していません
                </p>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
