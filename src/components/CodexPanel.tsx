import { useGame } from '../game/GameContext'
import { getFacilityLevel } from '../game/unlocks'

export function CodexPanel() {
  const { state, facilities, residents, stories, achievements } = useGame()

  const facilityFound = facilities.filter((f) => getFacilityLevel(state, f.id) > 0).length
  const residentFound = state.unlockedResidents.length
  const storyFound = state.unlockedStories.length
  const achFound = state.unlockedAchievements.length

  const rows = [
    { label: '施設', current: facilityFound, total: facilities.length },
    { label: '住人', current: residentFound, total: residents.length },
    { label: 'ストーリー', current: storyFound, total: stories.length },
    { label: '実績', current: achFound, total: achievements.length },
  ]

  return (
    <div>
      <h2 className="panel-title">図鑑</h2>
      <p className="panel-desc">収集状況の一覧です。埋まるほど箱庭の輪郭がはっきりします。</p>

      <div className="list">
        {rows.map((row) => {
          const pct = Math.round((row.current / row.total) * 100)
          return (
            <article key={row.label} className="list-item">
              <div className="list-item-header">
                <h3>{row.label}</h3>
                <strong>
                  {row.current} / {row.total}
                </strong>
              </div>
              <div
                style={{
                  marginTop: '0.55rem',
                  height: 8,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--accent), var(--amber))',
                    transition: 'width 0.35s ease',
                  }}
                />
              </div>
            </article>
          )
        })}

        <article className="list-item">
          <div className="list-item-header">
            <h3>プレイ統計</h3>
          </div>
          <p>タイピング回数：{state.stats.typingCount}</p>
          <p style={{ marginTop: 0 }}>最高コンボ：{state.stats.maxCombo}</p>
          <p style={{ marginTop: 0 }}>Perfect：{state.stats.perfectCount}</p>
          <p style={{ marginTop: 0 }}>
            累計文字片：{Math.floor(state.stats.lifetimeEarned.letters)}
          </p>
        </article>
      </div>
    </div>
  )
}
