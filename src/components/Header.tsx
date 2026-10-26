import { Link } from 'react-router-dom'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand} aria-label="CareerLens — на главную">
          <Logo />
          <span>CareerLens</span>
        </Link>
        <nav className={styles.nav}>
          <Link to="/#tests" className={styles.link}>
            Тесты
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
