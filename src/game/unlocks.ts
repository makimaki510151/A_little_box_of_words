import type {
  UnlockCondition,
  GameState,
  AchievementCondition,
  FacilityDef,
  ResidentDef,
} from '../types/game'

export function getFacilityLevel(state: GameState, facilityId: string): number {
  return state.facilities[facilityId]?.level ?? 0
}

export function getWorldLevel(state: GameState): number {
  return Object.values(state.facilities).reduce((sum, f) => sum + f.level, 0)
}

export function isUnlocked(state: GameState, condition?: UnlockCondition): boolean {
  if (!condition || condition.type === 'always') return true

  switch (condition.type) {
    case 'facilityLevel':
      return getFacilityLevel(state, condition.facilityId) >= condition.level
    case 'resource':
      return state.resources[condition.resource] >= condition.amount
    case 'resident':
      return state.unlockedResidents.includes(condition.residentId)
    case 'story':
      return state.unlockedStories.includes(condition.storyId)
    case 'typingCount':
      return state.stats.typingCount >= condition.count
    case 'worldLevel':
      return getWorldLevel(state) >= condition.level
    case 'and':
      return condition.conditions.every((c) => isUnlocked(state, c))
    case 'or':
      return condition.conditions.some((c) => isUnlocked(state, c))
    default:
      return false
  }
}

export function isAchievementMet(
  state: GameState,
  condition: AchievementCondition,
  facilities: FacilityDef[],
): boolean {
  switch (condition.type) {
    case 'typingCount':
      return state.stats.typingCount >= condition.count
    case 'combo':
      return state.stats.maxCombo >= condition.count
    case 'facilityBuilt': {
      const built = Object.values(state.facilities).filter((f) => f.level > 0).length
      if (condition.facilityId) {
        return getFacilityLevel(state, condition.facilityId) > 0
      }
      return built >= (condition.count ?? 1)
    }
    case 'facilityMaxed': {
      const def = facilities.find((f) => f.id === condition.facilityId)
      if (!def) return false
      return getFacilityLevel(state, condition.facilityId) >= def.maxLevel
    }
    case 'residentsUnlocked':
      return state.unlockedResidents.length >= condition.count
    case 'storyCleared':
      return state.readStories.includes(condition.storyId)
    case 'resourceEarned':
      return state.stats.lifetimeEarned[condition.resource] >= condition.amount
    default:
      return false
  }
}

export function describeUnlock(condition?: UnlockCondition): string {
  if (!condition || condition.type === 'always') return '最初から解放'
  switch (condition.type) {
    case 'facilityLevel':
      return `施設強化が必要`
    case 'resource':
      return `資源が必要`
    case 'resident':
      return `住人の登場が必要`
    case 'story':
      return `物語の進行が必要`
    case 'typingCount':
      return `タイピング ${condition.count} 回`
    case 'worldLevel':
      return `世界発展度 ${condition.level}`
    case 'and':
      return condition.conditions.map(describeUnlock).join(' かつ ')
    case 'or':
      return condition.conditions.map(describeUnlock).join(' または ')
    default:
      return '条件あり'
  }
}

export function collectNewResidents(
  state: GameState,
  residents: ResidentDef[],
): string[] {
  return residents
    .filter(
      (r) =>
        !state.unlockedResidents.includes(r.id) && isUnlocked(state, r.unlockCondition),
    )
    .map((r) => r.id)
}
