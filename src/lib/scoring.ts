import type { CareerTest, Dimension, Level } from '../tests/types'

/** Ответы теста: индекс варианта по каждому вопросу, null — вопрос пропущен. */
export type Answers = (number | null)[]

export interface DimensionScore {
  dimension: Dimension
  /** 0–100 */
  score: number
  level?: Level
}

export interface TestResult {
  scores: DimensionScore[]
  /** Шкалы по убыванию балла — для рейтинга */
  ranked: DimensionScore[]
  overall?: { score: number; level: Level }
}

export function levelFor(levels: Level[] | undefined, score: number): Level | undefined {
  return levels?.find((level) => score <= level.upTo) ?? levels?.at(-1)
}

/**
 * Ответ нормируется в [0, 1]. Прямой пункт добавляет w·x, обратный — |w|·(1 − x).
 * Балл шкалы — доля от максимума, поэтому шкалы с разным числом вопросов сравнимы.
 */
export function scoreTest(test: CareerTest, answers: Answers): TestResult {
  const max = test.scale.options.length - 1
  const sums = new Map<string, { got: number; total: number }>()

  test.questions.forEach((question, index) => {
    const answer = answers[index]
    if (answer == null) return
    const x = answer / max
    for (const [key, weight] of Object.entries(question.weights)) {
      const sum = sums.get(key) ?? { got: 0, total: 0 }
      sum.got += weight > 0 ? weight * x : -weight * (1 - x)
      sum.total += Math.abs(weight)
      sums.set(key, sum)
    }
  })

  const scores = test.dimensions.map((dimension) => {
    const sum = sums.get(dimension.key)
    const score = sum && sum.total > 0 ? Math.round((sum.got / sum.total) * 100) : 0
    return { dimension, score, level: levelFor(dimension.levels, score) }
  })

  const ranked = [...scores].sort((a, b) => b.score - a.score)

  let overall: TestResult['overall']
  if (test.result.overall) {
    const score = Math.round(scores.reduce((acc, s) => acc + s.score, 0) / scores.length)
    overall = { score, level: levelFor(test.result.overall.levels, score)! }
  }

  return { scores, ranked, overall }
}

/** Ответы в ссылке — строка цифр, «-» для пропуска: короткая ссылка без сервера. */
export function encodeAnswers(answers: Answers): string {
  return answers.map((a) => (a == null ? '-' : String(a))).join('')
}

export function decodeAnswers(test: CareerTest, raw: string | null): Answers | null {
  if (!raw || raw.length !== test.questions.length) return null
  const max = test.scale.options.length - 1
  const answers: Answers = []
  for (const char of raw) {
    if (char === '-') {
      answers.push(null)
      continue
    }
    const value = Number(char)
    if (!Number.isInteger(value) || value < 0 || value > max) return null
    answers.push(value)
  }
  return answers.some((a) => a != null) ? answers : null
}
