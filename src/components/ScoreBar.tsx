import styles from './ScoreBar.module.css'

/** Полоса балла 0–100 с плавным заполнением при появлении. */
export default function ScoreBar({ score, color, delay = 0 }: { score: number; color: string; delay?: number }) {
  return (
    <div className={styles.track}>
      <div
        className={styles.fill}
        style={{ width: `${Math.max(score, 2)}%`, background: color, animationDelay: `${delay}ms` }}
      />
    </div>
  )
}
