import type { Resources, ResourceId } from '../types/game'
import { emptyResources } from './constants'

export const RESOURCE_IDS: ResourceId[] = ['letters', 'memory', 'stardust']

export function addResources(a: Resources, b: Partial<Resources>): Resources {
  return {
    letters: a.letters + (b.letters ?? 0),
    memory: a.memory + (b.memory ?? 0),
    stardust: a.stardust + (b.stardust ?? 0),
  }
}

export function scaleResources(r: Partial<Resources>, factor: number): Resources {
  return {
    letters: (r.letters ?? 0) * factor,
    memory: (r.memory ?? 0) * factor,
    stardust: (r.stardust ?? 0) * factor,
  }
}

export function canAfford(owned: Resources, cost: Partial<Resources>): boolean {
  return RESOURCE_IDS.every((id) => owned[id] >= (cost[id] ?? 0))
}

export function spendResources(owned: Resources, cost: Partial<Resources>): Resources {
  if (!canAfford(owned, cost)) {
    throw new Error('Insufficient resources')
  }
  return {
    letters: owned.letters - (cost.letters ?? 0),
    memory: owned.memory - (cost.memory ?? 0),
    stardust: owned.stardust - (cost.stardust ?? 0),
  }
}

export function roundResources(r: Resources, digits = 2): Resources {
  const f = 10 ** digits
  return {
    letters: Math.floor(r.letters * f) / f,
    memory: Math.floor(r.memory * f) / f,
    stardust: Math.floor(r.stardust * f) / f,
  }
}

export function formatAmount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}K`
  if (Number.isInteger(n) || Math.abs(n - Math.round(n)) < 0.05) {
    return String(Math.floor(n))
  }
  return n.toFixed(1)
}

export function mergePartial(...parts: Partial<Resources>[]): Resources {
  return parts.reduce<Resources>((acc, part) => addResources(acc, part), emptyResources())
}

export function hasAnyResource(r: Partial<Resources>): boolean {
  return RESOURCE_IDS.some((id) => (r[id] ?? 0) > 0)
}

export function formatResourceGain(r: Partial<Resources>): string {
  return RESOURCE_IDS.filter((id) => (r[id] ?? 0) > 0)
    .map((id) => {
      const labels = { letters: '文字片', memory: '記憶', stardust: '星屑' }
      return `+${formatAmount(r[id] ?? 0)} ${labels[id]}`
    })
    .join(' / ')
}
