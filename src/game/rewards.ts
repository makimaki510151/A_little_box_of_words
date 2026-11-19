import type { PhraseDef, Resources, TypingResult } from '../types/game'
import { emptyResources } from './constants'
import { addResources, scaleResources, roundResources } from './resources'

/** 正確性補正: 0.5〜1.2（ミスが多いほど低いが、進行不能にはしない） */
export function accuracyMultiplier(accuracy: number): number {
  return 0.5 + accuracy * 0.7
}

/** 速度補正: CPS を緩やかに評価。正確性ほど重要ではない */
export function speedMultiplier(cps: number, difficulty: number): number {
  const target = 1.5 + difficulty * 0.4
  const ratio = Math.min(cps / target, 1.6)
  return 0.85 + ratio * 0.25
}

/** コンボ補正: 連続正確入力で最大 +50% */
export function comboMultiplier(combo: number): number {
  return 1 + Math.min(combo, 50) * 0.01
}

export function evaluateTyping(params: {
  phrase: PhraseDef
  typed: string
  misses: number
  startedAt: number
  finishedAt: number
  comboBefore: number
}): TypingResult {
  const { phrase, typed, misses, startedAt, finishedAt, comboBefore } = params
  const target = phrase.text
  const totalChars = target.length
  let correctChars = 0
  const compareLen = Math.min(typed.length, target.length)
  for (let i = 0; i < compareLen; i += 1) {
    if (typed[i] === target[i]) correctChars += 1
  }

  const accuracy = totalChars === 0 ? 1 : correctChars / totalChars
  const durationMs = Math.max(finishedAt - startedAt, 1)
  const cps = (correctChars / durationMs) * 1000
  const perfect = typed === target && misses === 0
  const comboAfter = perfect ? comboBefore + 1 : Math.max(0, Math.floor(comboBefore / 2))

  const base = {
    letters: phrase.baseReward.letters ?? 0,
    memory: phrase.baseReward.memory ?? 0,
    stardust: phrase.baseReward.stardust ?? 0,
  }

  const factor =
    accuracyMultiplier(accuracy) *
    speedMultiplier(cps, phrase.difficulty) *
    comboMultiplier(comboAfter)

  const reward = roundResources(scaleResources(base, factor), 2)

  return {
    phraseId: phrase.id,
    totalChars,
    correctChars,
    misses,
    accuracy,
    durationMs,
    cps,
    reward,
    comboAfter,
    perfect,
  }
}

export function workshopDiscount(level: number): number {
  // 工房レベルごとに強化コストを最大 25% まで軽減
  return Math.max(0.75, 1 - level * 0.03)
}

export function applyWorkshopToCost(
  cost: Partial<Resources>,
  workshopLevel: number,
): Resources {
  if (workshopLevel <= 0) {
    return {
      letters: cost.letters ?? 0,
      memory: cost.memory ?? 0,
      stardust: cost.stardust ?? 0,
    }
  }
  const d = workshopDiscount(workshopLevel)
  return scaleResources(cost, d)
}

export function combineRewards(...parts: Partial<Resources>[]): Resources {
  return parts.reduce<Resources>(
    (acc, part) => addResources(acc, part),
    emptyResources(),
  )
}
