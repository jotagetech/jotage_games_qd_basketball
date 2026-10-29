import styles from './HomePage.module.css'

export function HomePage() {
    return (
        <main className={styles.page}>
            <div className={styles.court} aria-hidden="true" />
            <div className={styles.content}>
                <img
                    className={styles.logo}
                    src="/brand/quadruplo-duplo.png"
                    alt="Quádruplo Duplo"
                    width={160}
                    height={160}
                />
                <h1 className={styles.title}>QD Basketball</h1>
                <p className={styles.message}>Estamos construindo o QD Basketball. Volte em breve.</p>
            </div>
        </main>
    )
}
