import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { findTest, categoryTitles } from '../tests'
import type { CareerTest } from '../tests/types'
import type { Answers } from '../lib/scoring'
import { completeTest, resetTest, saveProgress, useSaved } from '../lib/storage'
import { plural } from '../lib/plural'
import NotFoundPage from './NotFoundPage'
import styles from './TestPage.module.css'

export default function TestPage() {
  const { slug } = useParams()
  const test = findTest(slug)
  if (!test) return <NotFoundPage />
  // key сбрасывает состояние при переходе между тестами
  return <TestFlow key={test.slug} test={test} />
}

function TestFlow({ test }: { test: CareerTest }) {
  const saved = useSaved(test.slug)
  const inProgress = saved && !saved.completedAt && saved.answers.some((a) => a != null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    document.title = `${test.title} — CareerLens`
  }, [test])

  if (running) return <Quiz test={test} />

  const count = test.questions.length
  return (
    <section className={`container ${styles.intro}`}>
      <Link to="/" className={styles.back}>
        ← Все тесты
      </Link>
      <p className={styles.category}>
        {categoryTitles[test.category]}
        {test.it && <span className={styles.it}>IT</span>}
      </p>
      <h1 className={styles.title}>{test.title}</h1>
      <p className={styles.lead}>{test.description}</p>

      <ul className={styles.facts}>
        <li>
          <strong>{count}</strong> {plural(count, ['вопрос', 'вопроса', 'вопросов'])}
        </li>
        <li>
          <strong>~{test.minutes}</strong> мин
        </li>
        <li>
          <strong>{test.dimensions.length}</strong> {plural(test.dimensions.length, ['шкала', 'шкалы', 'шкал'])}
        </li>
      </ul>

      <div className={styles.dims}>
        {test.dimensions.map((d) => (
          <span key={d.key} className={styles.dim}>
            <i style={{ background: d.color }} />
            {d.short ?? d.title}
          </span>
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" className="btn btn-primary" onClick={() => setRunning(true)}>
          {inProgress ? 'Продолжить' : saved?.completedAt ? 'Пройти заново' : 'Начать тест'}
        </button>
        {inProgress && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              resetTest(test.slug)
              setRunning(true)
            }}
          >
            Начать сначала
          </button>
        )}
        {saved?.completedAt && (
          <Link to={`/tests/${test.slug}/result`} className="btn btn-ghost">
            Мой результат
          </Link>
        )}
      </div>

      <p className={styles.source}>{test.source}</p>
    </section>
  )
}

function Quiz({ test }: { test: CareerTest }) {
  const navigate = useNavigate()
  const saved = useSaved(test.slug)
  const total = test.questions.length

  const [answers, setAnswers] = useState<Answers>(() =>
    saved && !saved.completedAt ? saved.answers : Array(total).fill(null),
  )
  const [current, setCurrent] = useState(() =>
    saved && !saved.completedAt ? Math.min(saved.current, total - 1) : 0,
  )
  const timer = useRef<number>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const answer = useCallback(
    (value: number) => {
      const next = [...answers]
      next[current] = value
      setAnswers(next)
      window.clearTimeout(timer.current)

      if (current === total - 1) {
        completeTest(test.slug, next)
        timer.current = window.setTimeout(() => navigate(`/tests/${test.slug}/result`), 250)
        return
      }
      saveProgress(test.slug, next, current + 1)
      // Небольшая пауза, чтобы было видно выбранный вариант
      timer.current = window.setTimeout(() => setCurrent(current + 1), 220)
    },
    [answers, current, total, test.slug, navigate],
  )

  const back = useCallback(() => {
    window.clearTimeout(timer.current)
    setCurrent((c) => Math.max(0, c - 1))
  }, [])

  const forward = useCallback(() => {
    if (answers[current] != null && current < total - 1) setCurrent(current + 1)
  }, [answers, current, total])

  // Клавиатура: цифры — варианты ответа, стрелки — навигация
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const n = Number(event.key)
      if (Number.isInteger(n) && n >= 1 && n <= test.scale.options.length) answer(n - 1)
      else if (event.key === 'ArrowLeft') back()
      else if (event.key === 'ArrowRight') forward()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answer, back, forward, test.scale.options.length])

  const question = test.questions[current]
  const answeredCount = answers.filter((a) => a != null).length
  const progress = (answeredCount / total) * 100

  return (
    <section className={`container ${styles.quiz}`}>
      <div className={styles.quizHead}>
        <Link to="/" className={styles.back}>
          ← Все тесты
        </Link>
        <span className={styles.quizTitle}>{test.title}</span>
        <span className={styles.counter}>
          {current + 1} / {total}
        </span>
      </div>
      <div
        className={styles.progress}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answeredCount}
      >
        <div style={{ width: `${progress}%` }} />
      </div>

      <div key={current} className={styles.card}>
        <h2 className={styles.question}>{question.text}</h2>
        <div className={styles.options} role="radiogroup" aria-label="Варианты ответа">
          {test.scale.options.map((option, value) => (
            <button
              key={option.label}
              type="button"
              role="radio"
              aria-checked={answers[current] === value}
              className={answers[current] === value ? styles.optionActive : styles.option}
              onClick={() => answer(value)}
            >
              <span className={styles.dot} data-step={value} />
              <span className={styles.label}>{option.label}</span>
              <kbd className={styles.key}>{value + 1}</kbd>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.nav}>
        <button type="button" className="btn btn-ghost" onClick={back} disabled={current === 0}>
          Назад
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={forward}
          disabled={answers[current] == null || current === total - 1}
        >
          Дальше
        </button>
      </div>
      <p className={styles.hint}>Подсказка: можно отвечать клавишами 1–{test.scale.options.length}</p>
    </section>
  )
}
