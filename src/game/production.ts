import type {
  FacilityDef,
  GameState,
  ResidentDef,
  Resources,
  OfflineGain,
  ResourceId,
} from '../types/game'
import { OFFLINE_CAP_MS, emptyResources } from './constants'
import { addResources, roundResources, scaleResources } from './resources'
import { getFacilityLevel } from './unlocks'

function productionPerSecond(
  def: FacilityDef,
  level: number,
  bonuses: Partial<Record<ResourceId, number>>,
): Resources {
  if (level <= 0) return emptyResources()
  const levelFactor = level * (1 + (level - 1) * 0.08)
  const perInterval = scaleResources(def.production, levelFactor)
  const perSecond = scaleResources(perInterval, 1000 / def.productionIntervalMs)

  return {
    letters: perSecond.letters * (1 + (bonuses.letters ?? 0)),
    memory: perSecond.memory * (1 + (bonuses.memory ?? 0)),
    stardust: perSecond.stardust * (1 + (bonuses.stardust ?? 0)),
  }
}

export function getResidentBonuses(
  state: GameState,
  residents: ResidentDef[],
): Partial<Record<ResourceId, number>> {
  const bonuses: Partial<Record<ResourceId, number>> = {}
  for (const resident of residents) {
    if (!state.unlockedResidents.includes(resident.id) || !resident.productionBonus) {
      continue
    }
    for (const [key, value] of Object.entries(resident.productionBonus)) {
      const id = key as ResourceId
      bonuses[id] = (bonuses[id] ?? 0) + (value ?? 0)
    }
  }
  return bonuses
}

export function getTotalProductionPerSecond(
  state: GameState,
  facilities: FacilityDef[],
  residents: ResidentDef[],
): Resources {
  const bonuses = getResidentBonuses(state, residents)
  return facilities.reduce<Resources>((acc, def) => {
    const level = getFacilityLevel(state, def.id)
    return addResources(acc, productionPerSecond(def, level, bonuses))
  }, emptyResources())
}

export function produceForDuration(
  state: GameState,
  facilities: FacilityDef[],
  residents: ResidentDef[],
  durationMs: number,
): Resources {
  if (durationMs <= 0) return emptyResources()
  const perSecond = getTotalProductionPerSecond(state, facilities, residents)
  return roundResources(scaleResources(perSecond, durationMs / 1000), 3)
}

export function calculateOfflineGain(
  state: GameState,
  facilities: FacilityDef[],
  residents: ResidentDef[],
  now = Date.now(),
): OfflineGain {
  const elapsedMs = Math.max(0, now - state.lastSavedAt)
  const cappedMs = Math.min(elapsedMs, OFFLINE_CAP_MS)
  const gain = produceForDuration(state, facilities, residents, cappedMs)
  return { elapsedMs, cappedMs, gain }
}

export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}時間${m}分`
  if (m > 0) return `${m}分${s}秒`
  return `${s}秒`
}
