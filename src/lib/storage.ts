import { useSyncExternalStore } from 'react'
import type { Answers } from './scoring'

/** Всё хранится только в браузере пользователя: прогресс и последние результаты. */
interface Saved {
  answers: Answers
  /** Позиция, на которой человек остановился */
  current: number
  completedAt?: string
}

type Store = Record<string, Saved>

const KEY = 'careerlens:v1'
const listeners = new Set<() => void>()
let cache: Store | null = null

function read(): Store {
  if (cache) return cache
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Store
  } catch {
    cache = {}
  }
  return cache
}

function write(next: Store) {
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Приватный режим или переполнение — прогресс просто не переживёт перезагрузку
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useSaved(slug: string): Saved | undefined {
  return useSyncExternalStore(subscribe, () => read()[slug])
}

export function useAllSaved(): Store {
  return useSyncExternalStore(subscribe, read)
}

export function saveProgress(slug: string, answers: Answers, current: number) {
  const prev = read()[slug]
  write({ ...read(), [slug]: { ...prev, answers, current } })
}

export function completeTest(slug: string, answers: Answers) {
  write({ ...read(), [slug]: { answers, current: answers.length, completedAt: new Date().toISOString() } })
}

export function resetTest(slug: string) {
  const next = { ...read() }
  delete next[slug]
  write(next)
}
