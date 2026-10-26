import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import TestCard from '../components/TestCard'
import { categoryTitles, tests } from '../tests'
import type { TestCategory } from '../tests/types'
import styles from './HomePage.module.css'

type Filter = 'all' | 'it' | TestCategory

const filters: { key: Filter; title: string }[] = [
  { key: 'all', title: 'Все' },
  ...(Object.keys(categoryTitles) as TestCategory[]).map((key) => ({ key, title: categoryTitles[key] })),
  { key: 'it', title: 'Для IT' },
]

const steps = [
  { title: 'Выберите тест', text: 'От 3 до 8 минут. Прогресс сохраняется — можно вернуться позже.' },
  { title: 'Отвечайте честно', text: 'Правильных ответов нет. Первая реакция обычно самая точная.' },
  { title: 'Получите разбор', text: 'Наглядный профиль, объяснение каждой шкалы и практические советы.' },
]

export default function HomePage() {
  const [filter, setFilter] = useState<Filter>('all')
  const { hash } = useLocation()

  // Роутер не прокручивает к якорю сам: ссылка «Тесты» в шапке ведёт на /#tests
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [hash])
  const visible = tests.filter((test) =>
    filter === 'all' ? true : filter === 'it' ? test.it : test.category === filter,
  )
  const questions = tests.reduce((sum, test) => sum + test.questions.length, 0)

  return (
    <>
      <section className={`container ${styles.hero}`}>
        <p className={styles.eyebrow}>Бесплатно · без регистрации</p>
        <h1 className={styles.title}>
          Посмотрите на свою карьеру <span className="gradient-text">через новую линзу</span>
        </h1>
        <p className={styles.lead}>
          Психологические тесты, которые помогают выбрать профессию, понять свой стиль работы и вовремя заметить
          выгорание.
        </p>
        <div className={styles.actions}>
          <a href="#tests" className="btn btn-primary">
            Выбрать тест
          </a>
          <Link to="/tests/holland" className="btn btn-ghost">
            Начать с профориентации
          </Link>
        </div>
        <dl className={styles.stats}>
          <div>
            <dt>Тестов</dt>
            <dd>{tests.length}</dd>
          </div>
          <div>
            <dt>Вопросов</dt>
            <dd>{questions}</dd>
          </div>
          <div>
            <dt>Регистрация</dt>
            <dd>не нужна</dd>
          </div>
        </dl>
      </section>

      <section id="tests" className={`container ${styles.catalog}`}>
        <div className={styles.catalogHead}>
          <h2>Тесты</h2>
          <div className={styles.filters} role="tablist" aria-label="Категории тестов">
            {filters.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={filter === item.key}
                className={filter === item.key ? styles.filterActive : styles.filter}
                onClick={() => setFilter(item.key)}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.grid}>
          {visible.map((test, index) => (
            <TestCard key={`${filter}-${test.slug}`} test={test} index={index} />
          ))}
        </div>
      </section>

      <section className={`container ${styles.how}`}>
        <h2>Как это работает</h2>
        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className={styles.stepNum}>{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
