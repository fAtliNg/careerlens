import { Link } from 'react-router-dom'
import type { CareerTest } from '../tests/types'
import { categoryTitles } from '../tests'
import { useSaved } from '../lib/storage'
import { plural } from '../lib/plural'
import styles from './TestCard.module.css'

export default function TestCard({ test, index }: { test: CareerTest; index: number }) {
  const saved = useSaved(test.slug)
  const done = Boolean(saved?.completedAt)
  const started = !done && saved && saved.answers.some((a) => a != null)
  const colors = test.dimensions.slice(0, 4).map((d) => d.color)

  return (
    <Link
      to={done ? `/tests/${test.slug}/result` : `/tests/${test.slug}`}
      className={styles.card}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={styles.top}>
        <div className={styles.dots} aria-hidden>
          {colors.map((color) => (
            <span key={color} style={{ background: color }} />
          ))}
        </div>
        <div className={styles.badges}>
          {test.it && <span className={styles.badgeIt}>IT</span>}
          {done && <span className={styles.badgeDone}>Пройден</span>}
          {started && <span className={styles.badgeProgress}>В процессе</span>}
        </div>
      </div>
      <p className={styles.category}>{categoryTitles[test.category]}</p>
      <h3 className={styles.title}>{test.title}</h3>
      <p className={styles.tagline}>{test.tagline}</p>
      <div className={styles.meta}>
        <span>
          {test.questions.length} {plural(test.questions.length, ['вопрос', 'вопроса', 'вопросов'])}
        </span>
        <span>~{test.minutes} мин</span>
        <span className={styles.arrow} aria-hidden>
          →
        </span>
      </div>
    </Link>
  )
}
