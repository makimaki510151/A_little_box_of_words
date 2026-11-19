import { getEffectiveUpgradeCost, facilityProductionLabel } from '../game/facilities'
import { RESOURCE_LABELS } from '../game/constants'
import { canAfford, formatAmount } from '../game/resources'
import { getFacilityLevel, isUnlocked, describeUnlock } from '../game/unlocks'
import { useGame } from '../game/GameContext'
import type { ResourceId } from '../types/game'

export function FacilityPanel() {
  const { state, facilities, upgradeFacility } = useGame()

  return (
    <div>
      <h2 className="panel-title">施設</h2>
      <p className="panel-desc">
        建設と強化で自動生産と世界の見た目を育てます。工房は他施設の強化コストを下げます。
      </p>

      <div className="list">
        {facilities.map((def) => {
          const unlocked = isUnlocked(state, def.unlockCondition)
          const level = getFacilityLevel(state, def.id)
          const maxed = level >= def.maxLevel
          const cost = getEffectiveUpgradeCost(state, def)
          const affordable = canAfford(state.resources, cost)
          const costIds = (Object.keys(cost) as ResourceId[]).filter((id) => (cost[id] ?? 0) > 0)

          return (
            <article key={def.id} className={`list-item ${unlocked ? '' : 'locked'}`}>
              <div className="list-item-header">
                <h3>
                  {def.name}{' '}
                  <span style={{ color: 'var(--ink-mute)', fontSize: '0.85rem' }}>
                    {level > 0 ? `Lv.${level}` : '未建設'}
                    {maxed ? ' / MAX' : ` / ${def.maxLevel}`}
                  </span>
                </h3>
                {!unlocked && <span className="badge">未解放</span>}
              </div>
              <p>{def.description}</p>
              <p style={{ marginTop: 0, color: 'var(--ink-mute)', fontSize: '0.8rem' }}>
                {unlocked
                  ? facilityProductionLabel(def, Math.max(level, 1))
                  : describeUnlock(def.unlockCondition)}
              </p>

              {unlocked && !maxed && (
                <div className="cost-line">
                  {costIds.map((id) => {
                    const need = cost[id] ?? 0
                    const enough = state.resources[id] >= need
                    return (
                      <span key={id} className={enough ? 'enough' : 'short'}>
                        {RESOURCE_LABELS[id]} {formatAmount(need)}
                      </span>
                    )
                  })}
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary"
                disabled={!unlocked || maxed || !affordable}
                onClick={() => upgradeFacility(def.id)}
              >
                {!unlocked ? '条件未達' : maxed ? '最大レベル' : level === 0 ? '建設する' : '強化する'}
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}
