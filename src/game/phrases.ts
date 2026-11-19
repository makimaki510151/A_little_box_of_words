import type { GameState, PhraseDef } from '../types/game'
import { isUnlocked } from './unlocks'

export function getAvailablePhrases(state: GameState, phrases: PhraseDef[]): PhraseDef[] {
  return phrases.filter((p) => isUnlocked(state, p.unlockCondition))
}

export function pickNextPhrase(
  state: GameState,
  phrases: PhraseDef[],
  avoidIds: string[] = state.lastPhraseIds,
): PhraseDef {
  const available = getAvailablePhrases(state, phrases)
  if (available.length === 0) {
    return phrases[0]
  }

  const fresh = available.filter((p) => !avoidIds.includes(p.id))
  const pool = fresh.length > 0 ? fresh : available

  // 難易度と世界発展に応じて少し重み付け
  const world = Object.values(state.facilities).reduce((s, f) => s + f.level, 0)
  const weights = pool.map((p) => {
    const distance = Math.abs(p.difficulty - (1 + Math.min(world / 5, 3)))
    return Math.max(0.2, 2 - distance)
  })
  const total = weights.reduce((a, b) => a + b, 0)
  let roll = Math.random() * total
  for (let i = 0; i < pool.length; i += 1) {
    roll -= weights[i]
    if (roll <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}

export function pushRecentPhraseId(ids: string[], id: string, limit = 5): string[] {
  const next = [id, ...ids.filter((x) => x !== id)]
  return next.slice(0, limit)
}
