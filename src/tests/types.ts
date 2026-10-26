/** Вариант ответа. value — позиция на шкале, от 0 до options.length - 1. */
export interface AnswerOption {
  label: string
}

export interface AnswerScale {
  options: AnswerOption[]
}

/**
 * Вопрос влияет на одну или несколько шкал с весом.
 * Отрицательный вес — обратный пункт: чем выше ответ, тем ниже балл по шкале.
 */
export interface Question {
  text: string
  weights: Record<string, number>
}

/** Уровень выраженности шкалы: действует, пока балл не больше upTo (0–100). */
export interface Level {
  upTo: number
  title: string
  text: string
  tone?: 'good' | 'neutral' | 'warn' | 'bad'
}

export interface Dimension {
  key: string
  title: string
  /** Короткая подпись для диаграммы */
  short?: string
  description: string
  color: string
  levels?: Level[]
  /** Подходящие профессии или роли — для тестов-рейтингов */
  examples?: string[]
  /** Дополнительные списки в карточке: сильные стороны, риски, советы */
  details?: { title: string; items: string[] }[]
}

export type TestCategory = 'career' | 'personality' | 'state'

export interface CareerTest {
  slug: string
  title: string
  tagline: string
  description: string
  category: TestCategory
  /** Тест про IT-профессии — попадает в фильтр «Для IT» */
  it?: boolean
  minutes: number
  /** Откуда методика: показываем на странице теста и результата */
  source: string
  scale: AnswerScale
  dimensions: Dimension[]
  questions: Question[]
  result: {
    /** profile — все шкалы с уровнями, ranking — шкалы по убыванию, главное — верхние */
    kind: 'profile' | 'ranking'
    chart: 'radar' | 'bars' | 'quadrant'
    /** Сколько верхних шкал выделять в рейтинге */
    top?: number
    /** Подпись над ведущей шкалой, по умолчанию «Больше всего вам подходит» */
    headline?: string
    /** Код из первых букв ведущих шкал (Голланд — 3, DISC — 2) */
    code?: number
    /** Итог по среднему всех шкал, если у теста есть общий показатель */
    overall?: { title: string; levels: Level[] }
    /** Как читать результат: пара абзацев под диаграммой */
    notes?: string[]
  }
}
