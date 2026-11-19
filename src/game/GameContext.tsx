import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import phrasesData from '../data/phrases.json'
import facilitiesData from '../data/facilities.json'
import residentsData from '../data/residents.json'
import storiesData from '../data/stories.json'
import achievementsData from '../data/achievements.json'
import type {
  AchievementDef,
  FacilityDef,
  GameState,
  OfflineGain,
  PanelId,
  PhraseDef,
  ResidentDef,
  Resources,
  SettingsState,
  StoryDef,
  TypingResult,
} from '../types/game'
import {
  AUTO_SAVE_INTERVAL_MS,
  TICK_INTERVAL_MS,
  createInitialState,
} from './constants'
import { canBuildOrUpgrade, getEffectiveUpgradeCost } from './facilities'
import { pickNextPhrase, pushRecentPhraseId } from './phrases'
import {
  calculateOfflineGain,
  getTotalProductionPerSecond,
  produceForDuration,
} from './production'
import { evaluateTyping } from './rewards'
import {
  addResources,
  canAfford,
  hasAnyResource,
  spendResources,
} from './resources'
import { clearSave, exportSave, importSave, loadGame, saveGame } from './save'
import {
  collectNewResidents,
  getFacilityLevel,
  getWorldLevel,
  isAchievementMet,
  isUnlocked,
} from './unlocks'

const phrases = phrasesData as PhraseDef[]
const facilities = facilitiesData as FacilityDef[]
const residents = residentsData as ResidentDef[]
const stories = storiesData as StoryDef[]
const achievements = achievementsData as AchievementDef[]

interface ToastItem {
  id: string
  message: string
  kind: 'info' | 'success' | 'story' | 'achievement'
}

interface GameContextValue {
  state: GameState
  phrases: PhraseDef[]
  facilities: FacilityDef[]
  residents: ResidentDef[]
  stories: StoryDef[]
  achievements: AchievementDef[]
  currentPhrase: PhraseDef
  activePanel: PanelId
  setActivePanel: (panel: PanelId) => void
  productionPerSecond: Resources
  worldLevel: number
  offlineGain: OfflineGain | null
  claimOffline: () => void
  dismissOffline: () => void
  lastResult: TypingResult | null
  submitTyping: (typed: string, misses: number, startedAt: number) => TypingResult
  upgradeFacility: (facilityId: string) => boolean
  readStory: (storyId: string) => void
  claimAchievement: (achievementId: string) => void
  updateSettings: (patch: Partial<SettingsState>) => void
  resetGame: () => void
  exportData: () => string
  importData: (json: string) => boolean
  toasts: ToastItem[]
  dismissToast: (id: string) => void
  storyModal: StoryDef | null
  closeStoryModal: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

function syncProgress(state: GameState): {
  state: GameState
  notices: string[]
  newStories: StoryDef[]
  newAchievements: AchievementDef[]
} {
  let next = { ...state }
  const notices: string[] = []

  const newResidents = collectNewResidents(next, residents)
  if (newResidents.length > 0) {
    next = {
      ...next,
      unlockedResidents: [...next.unlockedResidents, ...newResidents],
    }
    for (const id of newResidents) {
      const r = residents.find((x) => x.id === id)
      if (r) notices.push(`住人が登場しました：${r.name}`)
    }
  }

  const newlyUnlockedStories = stories.filter(
    (s) =>
      !next.unlockedStories.includes(s.id) && isUnlocked(next, s.unlockCondition),
  )
  if (newlyUnlockedStories.length > 0) {
    next = {
      ...next,
      unlockedStories: [
        ...next.unlockedStories,
        ...newlyUnlockedStories.map((s) => s.id),
      ],
    }
  }

  const newAchievements = achievements.filter(
    (a) =>
      !next.unlockedAchievements.includes(a.id) &&
      isAchievementMet(next, a.condition, facilities),
  )
  if (newAchievements.length > 0) {
    next = {
      ...next,
      unlockedAchievements: [
        ...next.unlockedAchievements,
        ...newAchievements.map((a) => a.id),
      ],
    }
  }

  return { state: next, notices, newStories: newlyUnlockedStories, newAchievements }
}

let toastSeq = 0
function makeToastId() {
  toastSeq += 1
  return `toast-${toastSeq}-${Date.now()}`
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(() => loadGame() ?? createInitialState())
  const [currentPhrase, setCurrentPhrase] = useState<PhraseDef>(() =>
    pickNextPhrase(loadGame() ?? createInitialState(), phrases),
  )
  const [activePanel, setActivePanel] = useState<PanelId>('typing')
  const [lastResult, setLastResult] = useState<TypingResult | null>(null)
  const [offlineGain, setOfflineGain] = useState<OfflineGain | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [storyModal, setStoryModal] = useState<StoryDef | null>(null)
  const bootstrapped = useRef(false)
  const stateRef = useRef(state)
  stateRef.current = state

  const pushToast = useCallback((message: string, kind: ToastItem['kind'] = 'info') => {
    const id = makeToastId()
    setToasts((prev) => [...prev.slice(-4), { id, message, kind }])
  }, [])

  const applySync = useCallback(
    (draft: GameState, opts?: { openStory?: boolean }) => {
      const synced = syncProgress(draft)
      for (const notice of synced.notices) {
        pushToast(notice, 'success')
      }
      for (const ach of synced.newAchievements) {
        pushToast(`実績解除：${ach.name}`, 'achievement')
      }
      if (opts?.openStory !== false && synced.newStories.length > 0) {
        const story = synced.newStories[0]
        setStoryModal(story)
        pushToast(`物語解放：${story.title}`, 'story')
      } else {
        for (const story of synced.newStories) {
          pushToast(`物語解放：${story.title}`, 'story')
        }
      }
      return synced.state
    },
    [pushToast],
  )

  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true
    const saved = loadGame()
    if (!saved) {
      const initial = applySync(createInitialState())
      setState(initial)
      setCurrentPhrase(pickNextPhrase(initial, phrases))
      const prologue = stories.find((s) => s.id === 'ch0_s0')
      if (prologue) setStoryModal(prologue)
      return
    }
    const offline = calculateOfflineGain(saved, facilities, residents)
    if (hasAnyResource(offline.gain) && offline.cappedMs > 1000) {
      setOfflineGain(offline)
    }
    const synced = applySync(saved, { openStory: false })
    setState(synced)
    setCurrentPhrase(pickNextPhrase(synced, phrases))
  }, [applySync])

  useEffect(() => {
    const id = window.setInterval(() => {
      setState((prev) => {
        const gain = produceForDuration(prev, facilities, residents, TICK_INTERVAL_MS)
        if (!hasAnyResource(gain)) return prev
        const withGain: GameState = {
          ...prev,
          resources: addResources(prev.resources, gain),
          stats: {
            ...prev.stats,
            lifetimeEarned: addResources(prev.stats.lifetimeEarned, gain),
          },
        }
        return applySync(withGain, { openStory: true })
      })
    }, TICK_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [applySync])

  useEffect(() => {
    const id = window.setInterval(() => {
      saveGame(stateRef.current)
    }, AUTO_SAVE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const onHide = () => saveGame(stateRef.current)
    window.addEventListener('beforeunload', onHide)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') saveGame(stateRef.current)
    })
    return () => {
      window.removeEventListener('beforeunload', onHide)
    }
  }, [])

  const productionPerSecond = useMemo(
    () => getTotalProductionPerSecond(state, facilities, residents),
    [state],
  )
  const worldLevel = useMemo(() => getWorldLevel(state), [state])

  const claimOffline = useCallback(() => {
    if (!offlineGain) return
    setState((prev) => {
      const next: GameState = {
        ...prev,
        resources: addResources(prev.resources, offlineGain.gain),
        stats: {
          ...prev.stats,
          lifetimeEarned: addResources(prev.stats.lifetimeEarned, offlineGain.gain),
        },
        lastSavedAt: Date.now(),
      }
      const synced = applySync(next)
      saveGame(synced)
      return synced
    })
    setOfflineGain(null)
    pushToast('おかえりなさい。放置生産を受け取りました', 'success')
  }, [offlineGain, applySync, pushToast])

  const dismissOffline = useCallback(() => {
    setOfflineGain(null)
  }, [])

  const submitTyping = useCallback(
    (typed: string, misses: number, startedAt: number) => {
      const phrase = currentPhrase
      const result = evaluateTyping({
        phrase,
        typed,
        misses,
        startedAt,
        finishedAt: Date.now(),
        comboBefore: stateRef.current.combo,
      })

      setState((prev) => {
        const next: GameState = {
          ...prev,
          resources: addResources(prev.resources, result.reward),
          combo: result.comboAfter,
          lastPhraseIds: pushRecentPhraseId(prev.lastPhraseIds, phrase.id),
          stats: {
            ...prev.stats,
            typingCount: prev.stats.typingCount + 1,
            perfectCount: prev.stats.perfectCount + (result.perfect ? 1 : 0),
            totalCharsTyped: prev.stats.totalCharsTyped + typed.length,
            totalCorrectChars: prev.stats.totalCorrectChars + result.correctChars,
            totalMisses: prev.stats.totalMisses + misses,
            maxCombo: Math.max(prev.stats.maxCombo, result.comboAfter),
            lifetimeEarned: addResources(prev.stats.lifetimeEarned, result.reward),
          },
        }
        const synced = applySync(next)
        saveGame(synced)
        return synced
      })

      setLastResult(result)
      setCurrentPhrase(pickNextPhrase(stateRef.current, phrases, [
        ...stateRef.current.lastPhraseIds,
        phrase.id,
      ]))
      return result
    },
    [currentPhrase, applySync],
  )

  const upgradeFacility = useCallback(
    (facilityId: string) => {
      const def = facilities.find((f) => f.id === facilityId)
      if (!def) return false
      const current = stateRef.current
      if (!canBuildOrUpgrade(current, def)) return false
      const cost = getEffectiveUpgradeCost(current, def)
      if (!canAfford(current.resources, cost)) return false

      const prevLevel = getFacilityLevel(current, facilityId)
      setState((prev) => {
        const nextLevel = getFacilityLevel(prev, facilityId) + 1
        const next: GameState = {
          ...prev,
          resources: spendResources(prev.resources, cost),
          facilities: {
            ...prev.facilities,
            [facilityId]: { level: nextLevel },
          },
          stats: {
            ...prev.stats,
            facilitiesBuilt:
              prevLevel === 0 ? prev.stats.facilitiesBuilt + 1 : prev.stats.facilitiesBuilt,
          },
        }
        const synced = applySync(next)
        saveGame(synced)
        return synced
      })
      pushToast(
        prevLevel === 0 ? `${def.name}を建設しました` : `${def.name}を Lv.${prevLevel + 1} に強化`,
        'success',
      )
      return true
    },
    [applySync, pushToast],
  )

  const readStory = useCallback((storyId: string) => {
    setState((prev) => {
      if (prev.readStories.includes(storyId)) return prev
      const next = applySync({
        ...prev,
        readStories: [...prev.readStories, storyId],
      })
      saveGame(next)
      return next
    })
  }, [applySync])

  const claimAchievement = useCallback(
    (achievementId: string) => {
      const def = achievements.find((a) => a.id === achievementId)
      if (!def?.reward) return
      setState((prev) => {
        if (
          !prev.unlockedAchievements.includes(achievementId) ||
          prev.claimedAchievementRewards.includes(achievementId)
        ) {
          return prev
        }
        const next: GameState = {
          ...prev,
          resources: addResources(prev.resources, def.reward ?? {}),
          claimedAchievementRewards: [...prev.claimedAchievementRewards, achievementId],
          stats: {
            ...prev.stats,
            lifetimeEarned: addResources(prev.stats.lifetimeEarned, def.reward ?? {}),
          },
        }
        const synced = applySync(next)
        saveGame(synced)
        return synced
      })
      pushToast('実績報酬を受け取りました', 'achievement')
    },
    [applySync, pushToast],
  )

  const updateSettings = useCallback((patch: Partial<SettingsState>) => {
    setState((prev) => {
      const next = { ...prev, settings: { ...prev.settings, ...patch } }
      saveGame(next)
      return next
    })
  }, [])

  const resetGame = useCallback(() => {
    clearSave()
    const initial = applySync(createInitialState())
    setState(initial)
    setCurrentPhrase(pickNextPhrase(initial, phrases))
    setLastResult(null)
    setOfflineGain(null)
    const prologue = stories.find((s) => s.id === 'ch0_s0')
    if (prologue) setStoryModal(prologue)
    pushToast('ゲームを初期化しました', 'info')
  }, [applySync, pushToast])

  const exportData = useCallback(() => exportSave(stateRef.current), [])

  const importData = useCallback(
    (json: string) => {
      try {
        const imported = applySync(importSave(json), { openStory: false })
        setState(imported)
        setCurrentPhrase(pickNextPhrase(imported, phrases))
        saveGame(imported)
        pushToast('セーブデータを読み込みました', 'success')
        return true
      } catch {
        pushToast('読み込みに失敗しました', 'info')
        return false
      }
    },
    [applySync, pushToast],
  )

  const closeStoryModal = useCallback(() => {
    if (storyModal) {
      readStory(storyModal.id)
    }
    setStoryModal(null)
  }, [storyModal, readStory])

  const value: GameContextValue = {
    state,
    phrases,
    facilities,
    residents,
    stories,
    achievements,
    currentPhrase,
    activePanel,
    setActivePanel,
    productionPerSecond,
    worldLevel,
    offlineGain,
    claimOffline,
    dismissOffline,
    lastResult,
    submitTyping,
    upgradeFacility,
    readStory,
    claimAchievement,
    updateSettings,
    resetGame,
    exportData,
    importData,
    toasts,
    dismissToast: (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    storyModal,
    closeStoryModal,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
