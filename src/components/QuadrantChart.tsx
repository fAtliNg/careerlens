import type { DimensionScore } from '../lib/scoring'
import styles from './QuadrantChart.module.css'

const SIZE = 480
const C = SIZE / 2
const R = 170

function polar(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180
  return { x: C + Math.cos(rad) * radius, y: C + Math.sin(rad) * radius }
}

function sector(from: number, radius: number) {
  const a = polar(from, radius)
  const b = polar(from + 90, radius)
  return `M ${C} ${C} L ${a.x} ${a.y} A ${radius} ${radius} 0 0 1 ${b.x} ${b.y} Z`
}

/**
 * Круг из четырёх четвертей, как в классических схемах DISC:
 * первая шкала — слева сверху, дальше по часовой стрелке. Радиус сектора — балл шкалы.
 */
export default function QuadrantChart({ scores }: { scores: DimensionScore[] }) {
  // Углы в SVG отсчитываются от оси X по часовой стрелке
  const starts = [180, 270, 0, 90]
  const corners = [
    { x: 24, y: 34, anchor: 'start' },
    { x: SIZE - 24, y: 34, anchor: 'end' },
    { x: SIZE - 24, y: SIZE - 40, anchor: 'end' },
    { x: 24, y: SIZE - 40, anchor: 'start' },
  ] as const

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.chart} role="img" aria-label="Диаграмма стилей">
      {scores.slice(0, 4).map((s, i) => (
        <g key={s.dimension.key}>
          <path d={sector(starts[i], R)} fill={s.dimension.color} opacity="0.12" />
          <path
            className={styles.fill}
            style={{ animationDelay: `${i * 90}ms` }}
            d={sector(starts[i], Math.max(s.score, 6) * (R / 100))}
            fill={s.dimension.color}
          />
          <text x={corners[i].x} y={corners[i].y} textAnchor={corners[i].anchor} className={styles.letter} fill={s.dimension.color}>
            {s.dimension.key}
          </text>
          <text x={corners[i].x} y={corners[i].y + 24} textAnchor={corners[i].anchor} className={styles.label}>
            {s.dimension.short ?? s.dimension.title} · <tspan className={styles.value}>{s.score}</tspan>
          </text>
        </g>
      ))}
      <circle cx={C} cy={C} r={R} className={styles.outline} />
      <line x1={C - R} y1={C} x2={C + R} y2={C} className={styles.cross} />
      <line x1={C} y1={C - R} x2={C} y2={C + R} className={styles.cross} />
    </svg>
  )
}
