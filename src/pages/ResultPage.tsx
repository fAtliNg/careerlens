import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { findTest, tests } from '../tests'
import type { CareerTest, Level } from '../tests/types'
import { decodeAnswers, encodeAnswers, scoreTest, type TestResult } from '../lib/scoring'
import { useAllSaved, useSaved } from '../lib/storage'
import RadarChart from '../components/RadarChart'
import QuadrantChart from '../components/QuadrantChart'
import ScoreBar from '../components/ScoreBar'
import TestCard from '../components/TestCard'
import NotFoundPage from './NotFoundPage'
import styles from './ResultPage.module.css'

const toneColor: Record<NonNullable<Level['tone']>, string> = {
  good: 'var(--good)',
  neutral: 'var(--neutral)',
  warn: 'var(--warn)',
  bad: 'var(--bad)',
}

export default function ResultPage() {
  const { slug } = useParams()
  const test = findTest(slug)
  if (!test) return <NotFoundPage />
  return <Result key={test.slug} test={test} />
}

function Result({ test }: { test: CareerTest }) {
  const [params] = useSearchParams()
  const saved = useSaved(test.slug)
  const own = saved?.completedAt ? saved.answers : null
  const shared = decodeAnswers(test, params.get('a'))
  const answers = shared ?? own
  // Результат по чужой ссылке: показываем, но предлагаем пройти самому
  const foreign = shared != null && (!own || encodeAnswers(own) !== encodeAnswers(shared))
  const result = useMemo(() => (answers ? scoreTest(test, answers) : null), [test, answers])

  useEffect(() => {
    document.title = `Результат: ${test.title} — CareerLens`
  }, [test])

  if (!answers || !result) {
    return (
      <section className={`container ${styles.empty}`}>
        <h1>Результата пока нет</h1>
        <p>Пройдите тест «{test.title}» — это займёт около {test.minutes} минут.</p>
        <Link to={`/tests/${test.slug}`} className="btn btn-primary">
          Пройти тест
        </Link>
      </section>
    )
  }

  const shareUrl = `${location.origin}/tests/${test.slug}/result?a=${encodeAnswers(answers)}`

  return (
    <div className={`container ${styles.page}`}>
      <Link to="/" className={styles.back}>
        ← Все тесты
      </Link>

      {foreign && (
        <div className={styles.banner}>
          <span>Это результат другого человека, открытый по ссылке.</span>
          <Link to={`/tests/${test.slug}`} className="btn btn-primary">
            Пройти самому
          </Link>
        </div>
      )}

      <Summary test={test} result={result} />

      {(test.result.chart !== 'bars' || test.result.kind === 'ranking') && (
        <section className={styles.panel}>
          {test.result.chart === 'radar' ? (
            <RadarChart scores={result.scores} />
          ) : test.result.chart === 'quadrant' ? (
            <QuadrantChart scores={result.scores} />
          ) : (
            <RankBars result={result} />
          )}
        </section>
      )}

      {test.result.kind === 'ranking' ? <TopMatches test={test} result={result} /> : <Profile result={result} />}

      {test.result.notes && (
        <section className={styles.notes}>
          <h2>Как читать результат</h2>
          {test.result.notes.map((note) => (
            <p key={note}>{note}</p>
          ))}
          <p className={styles.source}>Источник: {test.source}</p>
        </section>
      )}

      {!foreign && <ShareActions test={test} url={shareUrl} />}

      <OtherTests current={test.slug} />
    </div>
  )
}

function Summary({ test, result }: { test: CareerTest; result: TestResult }) {
  const { overall, ranked } = result

  if (overall) {
    return (
      <header className={styles.summary}>
        <p className={styles.eyebrow}>{test.title}</p>
        <div className={styles.overall}>
          <div className={styles.gauge} style={{ '--value': overall.score } as React.CSSProperties}>
            <span>{overall.score}</span>
            <small>из 100</small>
          </div>
          <div>
            <p className={styles.overallTitle}>{test.result.overall!.title}</p>
            <h1 style={{ color: overall.level.tone ? toneColor[overall.level.tone] : undefined }}>
              {overall.level.title}
            </h1>
            <p className={styles.summaryText}>{overall.level.text}</p>
          </div>
        </div>
      </header>
    )
  }

  const top = ranked[0]
  const leading = ranked.slice(0, test.result.code ?? 3)
  // Код из первых букв ведущих шкал: CIR у Голланда, DC у DISC
  const code = test.result.code ? leading.map((s) => s.dimension.key).join('') : null
  const headline =
    test.result.headline ?? (test.result.kind === 'ranking' ? 'Больше всего вам подходит' : 'Ярче всего у вас выражено')

  return (
    <header className={styles.summary}>
      <p className={styles.eyebrow}>{test.title}</p>
      <p className={styles.overallTitle}>{headline}</p>
      <h1 className={styles.headline}>
        <span className="gradient-text">{top.dimension.title}</span>
      </h1>
      {test.result.kind === 'ranking' && (
        <p className={styles.summaryText}>
          {code && (
            <>
              Ваш код — <strong className={styles.code}>{code}</strong>.{' '}
            </>
          )}
          {leading.length > 2 ? 'Также близки' : 'Второй по силе'}:{' '}
          {leading
            .slice(1)
            .map((s) => s.dimension.title.toLowerCase())
            .join(' и ')}
          .
        </p>
      )}
    </header>
  )
}

function RankBars({ result }: { result: TestResult }) {
  return (
    <ul className={styles.rankBars}>
      {result.ranked.map((s, i) => (
        <li key={s.dimension.key}>
          <span className={styles.rankName}>{s.dimension.short ?? s.dimension.title}</span>
          <ScoreBar score={s.score} color={s.dimension.color} delay={i * 60} />
          <span className={styles.rankValue}>{s.score}%</span>
        </li>
      ))}
    </ul>
  )
}

function TopMatches({ test, result }: { test: CareerTest; result: TestResult }) {
  const top = result.ranked.slice(0, test.result.top ?? 3)
  return (
    <section className={styles.cards}>
      {top.map((s, i) => (
        <article key={s.dimension.key} className={styles.card} style={{ '--c': s.dimension.color } as React.CSSProperties}>
          <div className={styles.cardHead}>
            <span className={styles.rank}>{i + 1}</span>
            <h3>{s.dimension.title}</h3>
            <span className={styles.score}>{s.score}%</span>
          </div>
          <p className={styles.cardText}>{s.dimension.description}</p>
          {s.level && <p className={styles.cardText}>{s.level.text}</p>}
          {s.dimension.examples && (
            <div className={styles.chips}>
              {s.dimension.examples.map((example) => (
                <span key={example}>{example}</span>
              ))}
            </div>
          )}
          {s.dimension.details && (
            <div className={styles.details}>
              {s.dimension.details.map((block) => (
                <div key={block.title}>
                  <h4>{block.title}</h4>
                  <ul>
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </article>
      ))}
    </section>
  )
}

function Profile({ result }: { result: TestResult }) {
  return (
    <section className={styles.cards}>
      {result.scores.map((s, i) => (
        <article key={s.dimension.key} className={styles.card} style={{ '--c': s.dimension.color } as React.CSSProperties}>
          <div className={styles.cardHead}>
            <h3>{s.dimension.title}</h3>
            {s.level && (
              <span
                className={styles.level}
                style={{ color: s.level.tone ? toneColor[s.level.tone] : s.dimension.color }}
              >
                {s.level.title}
              </span>
            )}
            <span className={styles.score}>{s.score}</span>
          </div>
          <ScoreBar score={s.score} color={s.dimension.color} delay={i * 80} />
          <p className={styles.cardMuted}>{s.dimension.description}</p>
          {s.level && <p className={styles.cardText}>{s.level.text}</p>}
        </article>
      ))}
    </section>
  )
}

function ShareActions({ test, url }: { test: CareerTest; url: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const data = { title: `Мой результат: ${test.title}`, url }
    if (navigator.share) {
      try {
        await navigator.share(data)
        return
      } catch {
        // Отмена системного окна — пробуем скопировать ссылку
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      prompt('Скопируйте ссылку на результат', url)
    }
  }

  return (
    <div className={styles.share}>
      <button type="button" className="btn btn-primary" onClick={share}>
        {copied ? 'Ссылка скопирована' : 'Поделиться результатом'}
      </button>
      <Link to={`/tests/${test.slug}`} className="btn btn-ghost">
        Пройти заново
      </Link>
    </div>
  )
}

function OtherTests({ current }: { current: string }) {
  const saved = useAllSaved()
  // Сначала непройденные
  const others = tests
    .filter((test) => test.slug !== current)
    .sort((a, b) => Number(Boolean(saved[a.slug]?.completedAt)) - Number(Boolean(saved[b.slug]?.completedAt)))
    .slice(0, 3)

  return (
    <section className={styles.others}>
      <h2>Другие тесты</h2>
      <div className={styles.othersGrid}>
        {others.map((test, index) => (
          <TestCard key={test.slug} test={test} index={index} />
        ))}
      </div>
    </section>
  )
}
