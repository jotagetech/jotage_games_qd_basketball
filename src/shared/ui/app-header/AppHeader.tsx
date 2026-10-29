import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

import styles from './AppHeader.module.css'

interface AppHeaderProps {
    children?: ReactNode
}

export function AppHeader({ children }: AppHeaderProps) {
    return (
        <header className={styles.header}>
            <img
                className={styles.logo}
                src="/brand/quadruplo-duplo.png"
                alt="Quádruplo Duplo"
                width={48}
                height={48}
            />
            <h1 className={styles.title}>QD Basketball</h1>
            <nav className={styles.nav} aria-label="Principal">
                <NavLink className={styles.link} to="/" end>
                    Jogos
                </NavLink>
                <NavLink className={styles.link} to="/ranking">
                    Ranking
                </NavLink>
            </nav>
            {children}
        </header>
    )
}
