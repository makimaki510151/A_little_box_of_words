import { useGame } from '../game/GameContext'
import { getFacilityLevel } from '../game/unlocks'

const BUILDINGS = [
  { id: 'plaza', className: 'building-plaza plaza' },
  { id: 'library', className: 'building-library library' },
  { id: 'clocktower', className: 'building-clocktower clocktower' },
  { id: 'archive', className: 'building-archive archive' },
  { id: 'workshop', className: 'building-workshop workshop' },
] as const

export function WorldView() {
  const { state, worldLevel, facilities } = useGame()

  return (
    <section className="panel world-panel" aria-label="世界の様子">
      <div className="world-meta">
        <div className="world-level">
          世界発展度 <span>{worldLevel}</span>
        </div>
        <div className="badge">小箱の中の世界</div>
      </div>

      <div className="world-stage">
        <div className="world-sky" aria-hidden />
        <div className="world-ground" aria-hidden />

        {BUILDINGS.map((b) => {
          const level = getFacilityLevel(state, b.id)
          const def = facilities.find((f) => f.id === b.id)
          return (
            <div
              key={b.id}
              className={`building ${b.className} ${level > 0 ? 'built' : 'locked'}`}
              title={def ? `${def.name} Lv.${level}` : b.id}
            >
              <div className="b-shape" />
              <div className="building-glow" />
            </div>
          )
        })}

        {state.unlockedResidents.includes('lumen') && (
          <div className="resident-dot lumen" title="ルーメン" />
        )}
        {state.unlockedResidents.includes('mira') && (
          <div className="resident-dot mira" title="ミラ" />
        )}
        {state.unlockedResidents.includes('hora') && (
          <div className="resident-dot hora" title="ホラ" />
        )}
      </div>
    </section>
  )
}
