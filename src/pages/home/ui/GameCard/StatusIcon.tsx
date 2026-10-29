import type { GameStatus } from '../../model/game'
import styles from './GameCard.module.css'

interface StatusIconProps {
    status: GameStatus
}

const ICON_PATHS: Record<Exclude<GameStatus, 'live'>, string> = {
    scheduled: 'M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
    final: 'M5 12.5l4.5 4.5L19 7.5',
    postponed: 'M8 5v14M16 5v14',
    canceled: 'M6 6l12 12M18 6L6 18',
    unavailable: 'M12 8v5M12 16.5v.5M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
}

export function StatusIcon({ status }: StatusIconProps) {
    if (status === 'live') {
        return <span className={styles.dot} aria-hidden="true" />
    }

    return (
        <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d={ICON_PATHS[status]} />
        </svg>
    )
}
