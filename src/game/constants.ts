import type { Resources, SettingsState, GameState, PlayStats } from '../types/game'

export const SAVE_KEY = 'little-box-of-words-save'
export const SAVE_VERSION = 1
export const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000
export const AUTO_SAVE_INTERVAL_MS = 15_000
export const TICK_INTERVAL_MS = 250

export const RESOURCE_LABELS: Record<keyof Resources, string> = {
  letters: '文字片',
  memory: '記憶',
  stardust: '星屑',
}

export const emptyResources = (): Resources => ({
  letters: 0,
  memory: 0,
  stardust: 0,
})

export const defaultSettings = (): SettingsState => ({
  bgmVolume: 0.4,
  sfxVolume: 0.6,
  animations: true,
  fontSize: 'medium',
  scale: 1,
  colorTheme: 'ink',
})

export const defaultStats = (): PlayStats => ({
  typingCount: 0,
  perfectCount: 0,
  totalCharsTyped: 0,
  totalCorrectChars: 0,
  totalMisses: 0,
  maxCombo: 0,
  facilitiesBuilt: 0,
  lifetimeEarned: emptyResources(),
})

export const createInitialState = (): GameState => ({
  version: SAVE_VERSION,
  resources: { letters: 30, memory: 0, stardust: 0 },
  facilities: {},
  unlockedResidents: [],
  readStories: [],
  unlockedStories: ['ch0_s0'],
  unlockedAchievements: [],
  claimedAchievementRewards: [],
  stats: defaultStats(),
  combo: 0,
  lastPhraseIds: [],
  settings: defaultSettings(),
  lastSavedAt: Date.now(),
  worldNotices: [],
})

export const CATEGORY_LABELS = {
  word: '単語',
  sentence: '短文',
  long: '長文',
  special: '特別',
} as const
