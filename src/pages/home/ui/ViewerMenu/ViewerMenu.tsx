import { Link } from 'react-router-dom'

import type { Viewer } from '@/entities/viewer'
import { SignOutButton } from '@/features/auth'

import styles from './ViewerMenu.module.css'

const FALLBACK_NAME = 'Minha conta'

interface ViewerMenuProps {
    viewer: Viewer
}

export function ViewerMenu({ viewer }: ViewerMenuProps) {
    if (viewer.phase === 'loading') {
        return null
    }

    if (viewer.phase === 'anonymous') {
        return (
            <div className={styles.menu}>
                <Link className={styles.signIn} to="/login">
                    Entrar
                </Link>
            </div>
        )
    }

    const name = viewer.profile ? viewer.profile.username : FALLBACK_NAME

    return (
        <div className={styles.menu}>
            <span className={styles.name}>{name}</span>
            <SignOutButton />
        </div>
    )
}
