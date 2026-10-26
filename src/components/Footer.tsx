import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p>
          Тесты помогают лучше понять себя, но не заменяют консультацию психолога или карьерного консультанта. Ответы
          хранятся только в вашем браузере.
        </p>
        <p className={styles.meta}>
          © {new Date().getFullYear()} CareerLens ·{' '}
          <a href="https://denisenkosergey.ru" target="_blank" rel="noreferrer">
            Сергей Денисенко
          </a>
        </p>
      </div>
    </footer>
  )
}
