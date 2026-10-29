import styles from './DateNav.module.css'

interface DateNavProps {
    label: string
    onPrevious: () => void
    onNext: () => void
    onToday: () => void
}

export function DateNav({ label, onPrevious, onNext, onToday }: DateNavProps) {
    return (
        <nav className={styles.nav} aria-label="Navegação de data">
            <button type="button" className={styles.button} onClick={onPrevious} aria-label="Dia anterior">
                <span className={styles.arrow} aria-hidden="true">‹</span>
            </button>
            <p className={styles.label} aria-live="polite">
                {label}
            </p>
            <button type="button" className={styles.button} onClick={onNext} aria-label="Próximo dia">
                <span className={styles.arrow} aria-hidden="true">›</span>
            </button>
            <button type="button" className={styles.button} onClick={onToday}>
                Hoje
            </button>
        </nav>
    )
}
