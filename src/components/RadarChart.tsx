import type { DimensionScore } from '../lib/scoring'
import styles from './RadarChart.module.css'

const W = 560
const H = 420
const CX = W / 2
const CY = H / 2
const R = 150

function point(index: number, count: number, radius: number) {
  // Первая ось смотрит вверх, дальше по часовой стрелке
  const angle = (Math.PI * 2 * index) / count - Math.PI / 2
  return { x: CX + Math.cos(angle) * radius, y: CY + Math.sin(angle) * radius }
}

export default function RadarChart({ scores }: { scores: DimensionScore[] }) {
  const count = scores.length
  const polygon = scores
    .map((s, i) => {
      const p = point(i, count, (Math.max(s.score, 4) / 100) * R)
      return `${p.x},${p.y}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-label="Диаграмма результатов">
      <defs>
        <linearGradient id="radar-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c5cff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ff7a59" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {[25, 50, 75, 100].map((ring) => (
        <polygon
          key={ring}
          className={styles.ring}
          points={scores
            .map((_, i) => {
              const p = point(i, count, (ring / 100) * R)
              return `${p.x},${p.y}`
            })
            .join(' ')}
        />
      ))}

      {scores.map((_, i) => {
        const p = point(i, count, R)
        return <line key={i} className={styles.axis} x1={CX} y1={CY} x2={p.x} y2={p.y} />
      })}

      <polygon className={styles.shape} points={polygon} fill="url(#radar-fill)" />

      {scores.map((s, i) => {
        const p = point(i, count, (Math.max(s.score, 4) / 100) * R)
        return <circle key={s.dimension.key} className={styles.dot} cx={p.x} cy={p.y} r="5" fill={s.dimension.color} />
      })}

      {scores.map((s, i) => {
        const p = point(i, count, R + 26)
        const anchor = Math.abs(p.x - CX) < 4 ? 'middle' : p.x > CX ? 'start' : 'end'
        return (
          <text key={s.dimension.key} x={p.x} y={p.y} textAnchor={anchor} dominantBaseline="middle" className={styles.label}>
            <tspan>{s.dimension.short ?? s.dimension.title}</tspan>
            <tspan className={styles.value} dx="6">
              {s.score}
            </tspan>
          </text>
        )
      })}
    </svg>
  )
}
