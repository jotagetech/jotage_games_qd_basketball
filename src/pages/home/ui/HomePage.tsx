import styles from './HomePage.module.css'

export function HomePage() {
    return (
        <main className={styles.page}>
            <h1 className={styles.title}>QD Basketball</h1>
            <p className={styles.message}>Estamos construindo o QD Basketball. Volte em breve.</p>
        </main>
    )
}
