export type ResourceId = 'letters' | 'memory' | 'stardust'

export type PhraseCategory = 'word' | 'sentence' | 'long' | 'special'

export type PanelId =
  | 'typing'
  | 'facility'
  | 'resident'
  | 'story'
  | 'codex'
  | 'achievement'
  | 'settings'

export interface Resources {
  letters: number
  memory: number
  stardust: number
}

export interface PhraseDef {
  id: string
  text: string
  category: PhraseCategory
  difficulty: number
  baseReward: Partial<Resources>
  unlockCondition?: UnlockCondition
}

export interface FacilityDef {
  id: string
  name: string
  description: string
  maxLevel: number
  baseCost: Partial<Resources>
  costGrowth: number
  production: Partial<Resources>
  productionIntervalMs: number
  unlockCondition?: UnlockCondition
  visualOrder: number
}

export interface ResidentDef {
  id: string
  name: string
  title: string
  description: string
  unlockCondition: UnlockCondition
  effectDescription: string
  productionBonus?: Partial<Record<ResourceId, number>>
  dialogues: DialogueLine[]
}

export interface DialogueLine {
  speaker: string
  text: string
}

export interface StoryDef {
  id: string
  chapter: number
  section: number
  title: string
  summary: string
  unlockCondition: UnlockCondition
  dialogues: DialogueLine[]
}

export interface AchievementDef {
  id: string
  name: string
  description: string
  condition: AchievementCondition
  reward?: Partial<Resources>
}

export type UnlockCondition =
  | { type: 'always' }
  | { type: 'facilityLevel'; facilityId: string; level: number }
  | { type: 'resource'; resource: ResourceId; amount: number }
  | { type: 'resident'; residentId: string }
  | { type: 'story'; storyId: string }
  | { type: 'typingCount'; count: number }
  | { type: 'worldLevel'; level: number }
  | { type: 'and'; conditions: UnlockCondition[] }
  | { type: 'or'; conditions: UnlockCondition[] }

export type AchievementCondition =
  | { type: 'typingCount'; count: number }
  | { type: 'combo'; count: number }
  | { type: 'facilityBuilt'; facilityId?: string; count?: number }
  | { type: 'facilityMaxed'; facilityId: string }
  | { type: 'residentsUnlocked'; count: number }
  | { type: 'storyCleared'; storyId: string }
  | { type: 'resourceEarned'; resource: ResourceId; amount: number }

export interface SettingsState {
  bgmVolume: number
  sfxVolume: number
  animations: boolean
  fontSize: 'small' | 'medium' | 'large'
  scale: number
  colorTheme: 'ink' | 'dawn' | 'forest'
}

export interface PlayStats {
  typingCount: number
  perfectCount: number
  totalCharsTyped: number
  totalCorrectChars: number
  totalMisses: number
  maxCombo: number
  facilitiesBuilt: number
  lifetimeEarned: Resources
}

export interface FacilityState {
  level: number
}

export interface GameState {
  version: number
  resources: Resources
  facilities: Record<string, FacilityState>
  unlockedResidents: string[]
  readStories: string[]
  unlockedStories: string[]
  unlockedAchievements: string[]
  claimedAchievementRewards: string[]
  stats: PlayStats
  combo: number
  lastPhraseIds: string[]
  settings: SettingsState
  lastSavedAt: number
  worldNotices: string[]
}

export interface TypingResult {
  phraseId: string
  totalChars: number
  correctChars: number
  misses: number
  accuracy: number
  durationMs: number
  cps: number
  reward: Resources
  comboAfter: number
  perfect: boolean
}

export interface OfflineGain {
  elapsedMs: number
  cappedMs: number
  gain: Resources
}

export interface FloatingGain {
  id: string
  resource: ResourceId
  amount: number
  x: number
  y: number
}
