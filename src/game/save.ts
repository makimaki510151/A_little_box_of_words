import type { GameState } from '../types/game'
import { SAVE_KEY, SAVE_VERSION, createInitialState, defaultSettings, defaultStats } from './constants'
import { emptyResources } from './constants'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function migrateSave(raw: unknown): GameState {
  const base = createInitialState()
  if (!isObject(raw)) return base

  const version = typeof raw.version === 'number' ? raw.version : 0
  // Future migrations can branch on version
  void version

  const resources = isObject(raw.resources)
    ? {
        letters: Number(raw.resources.letters) || 0,
        memory: Number(raw.resources.memory) || 0,
        stardust: Number(raw.resources.stardust) || 0,
      }
    : base.resources

  const facilities: GameState['facilities'] = {}
  if (isObject(raw.facilities)) {
    for (const [id, value] of Object.entries(raw.facilities)) {
      if (isObject(value) && typeof value.level === 'number') {
        facilities[id] = { level: Math.max(0, Math.floor(value.level)) }
      }
    }
  }

  const settingsRaw = isObject(raw.settings) ? raw.settings : {}
  const statsRaw = isObject(raw.stats) ? raw.stats : {}
  const lifetime = isObject(statsRaw.lifetimeEarned)
    ? statsRaw.lifetimeEarned
    : emptyResources()

  return {
    version: SAVE_VERSION,
    resources,
    facilities,
    unlockedResidents: Array.isArray(raw.unlockedResidents)
      ? raw.unlockedResidents.filter((x): x is string => typeof x === 'string')
      : [],
    readStories: Array.isArray(raw.readStories)
      ? raw.readStories.filter((x): x is string => typeof x === 'string')
      : [],
    unlockedStories: Array.isArray(raw.unlockedStories)
      ? raw.unlockedStories.filter((x): x is string => typeof x === 'string')
      : ['ch0_s0'],
    unlockedAchievements: Array.isArray(raw.unlockedAchievements)
      ? raw.unlockedAchievements.filter((x): x is string => typeof x === 'string')
      : [],
    claimedAchievementRewards: Array.isArray(raw.claimedAchievementRewards)
      ? raw.claimedAchievementRewards.filter((x): x is string => typeof x === 'string')
      : [],
    stats: {
      ...defaultStats(),
      typingCount: Number(statsRaw.typingCount) || 0,
      perfectCount: Number(statsRaw.perfectCount) || 0,
      totalCharsTyped: Number(statsRaw.totalCharsTyped) || 0,
      totalCorrectChars: Number(statsRaw.totalCorrectChars) || 0,
      totalMisses: Number(statsRaw.totalMisses) || 0,
      maxCombo: Number(statsRaw.maxCombo) || 0,
      facilitiesBuilt: Number(statsRaw.facilitiesBuilt) || 0,
      lifetimeEarned: {
        letters: Number(lifetime.letters) || 0,
        memory: Number(lifetime.memory) || 0,
        stardust: Number(lifetime.stardust) || 0,
      },
    },
    combo: Number(raw.combo) || 0,
    lastPhraseIds: Array.isArray(raw.lastPhraseIds)
      ? raw.lastPhraseIds.filter((x): x is string => typeof x === 'string')
      : [],
    settings: {
      ...defaultSettings(),
      bgmVolume: typeof settingsRaw.bgmVolume === 'number' ? settingsRaw.bgmVolume : 0.4,
      sfxVolume: typeof settingsRaw.sfxVolume === 'number' ? settingsRaw.sfxVolume : 0.6,
      animations: settingsRaw.animations !== false,
      fontSize:
        settingsRaw.fontSize === 'small' || settingsRaw.fontSize === 'large'
          ? settingsRaw.fontSize
          : 'medium',
      scale: typeof settingsRaw.scale === 'number' ? settingsRaw.scale : 1,
      colorTheme:
        settingsRaw.colorTheme === 'dawn' || settingsRaw.colorTheme === 'forest'
          ? settingsRaw.colorTheme
          : 'ink',
    },
    lastSavedAt: typeof raw.lastSavedAt === 'number' ? raw.lastSavedAt : Date.now(),
    worldNotices: Array.isArray(raw.worldNotices)
      ? raw.worldNotices.filter((x): x is string => typeof x === 'string')
      : [],
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    return migrateSave(JSON.parse(raw))
  } catch {
    return null
  }
}

export function saveGame(state: GameState): void {
  const payload: GameState = {
    ...state,
    lastSavedAt: Date.now(),
    version: SAVE_VERSION,
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload))
}

export function exportSave(state: GameState): string {
  return JSON.stringify({ ...state, lastSavedAt: Date.now(), version: SAVE_VERSION }, null, 2)
}

export function importSave(json: string): GameState {
  return migrateSave(JSON.parse(json))
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY)
}
