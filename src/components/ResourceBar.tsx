import { RESOURCE_LABELS } from '../game/constants'
import { formatAmount } from '../game/resources'
import { useGame } from '../game/GameContext'
import type { ResourceId } from '../types/game'

const ORDER: ResourceId[] = ['letters', 'memory', 'stardust']

export function ResourceBar() {
  const { state, productionPerSecond } = useGame()

  return (
    <div className="resource-bar" aria-label="所持資源">
      {ORDER.map((id) => {
        const rate = productionPerSecond[id]
        return (
          <div key={id} className={`resource-chip ${id}`}>
            <span className="label">{RESOURCE_LABELS[id]}</span>
            <span className="value">{formatAmount(state.resources[id])}</span>
            {rate > 0.001 && (
              <span className="rate">+{formatAmount(rate)}/秒</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
