import type { FacilityDef, GameState, Resources } from '../types/game'
import { applyWorkshopToCost } from './rewards'
import { getFacilityLevel, isUnlocked } from './unlocks'
import { scaleResources } from './resources'

export function getUpgradeCost(def: FacilityDef, currentLevel: number): Partial<Resources> {
  const nextLevel = currentLevel + 1
  if (nextLevel > def.maxLevel) return {}
  const growth = def.costGrowth ** currentLevel
  return scaleResources(def.baseCost, growth)
}

export function getEffectiveUpgradeCost(
  state: GameState,
  def: FacilityDef,
): Resources {
  const level = getFacilityLevel(state, def.id)
  const raw = getUpgradeCost(def, level)
  const workshopLevel = getFacilityLevel(state, 'workshop')
  // 工房自身の強化には割引を適用しない
  if (def.id === 'workshop') {
    return {
      letters: raw.letters ?? 0,
      memory: raw.memory ?? 0,
      stardust: raw.stardust ?? 0,
    }
  }
  return applyWorkshopToCost(raw, workshopLevel)
}

export function canBuildOrUpgrade(state: GameState, def: FacilityDef): boolean {
  if (!isUnlocked(state, def.unlockCondition)) return false
  const level = getFacilityLevel(state, def.id)
  if (level >= def.maxLevel) return false
  return true
}

export function facilityProductionLabel(def: FacilityDef, level: number): string {
  if (level <= 0) return '未建設'
  const levelFactor = level * (1 + (level - 1) * 0.08)
  const parts: string[] = []
  const intervalSec = def.productionIntervalMs / 1000
  if (def.production.letters) {
    parts.push(`文字片 ${(def.production.letters * levelFactor).toFixed(1)}/${intervalSec}秒`)
  }
  if (def.production.memory) {
    parts.push(`記憶 ${(def.production.memory * levelFactor).toFixed(2)}/${intervalSec}秒`)
  }
  if (def.production.stardust) {
    parts.push(`星屑 ${(def.production.stardust * levelFactor).toFixed(2)}/${intervalSec}秒`)
  }
  return parts.join(' · ') || '特殊効果'
}
