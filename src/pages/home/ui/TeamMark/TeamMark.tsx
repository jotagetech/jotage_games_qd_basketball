import { useState, type CSSProperties } from 'react'

import { findTeamBrand, teamLogoUrl } from '../../config/teamBrand'
import { badgeTextColor } from '../../lib/badgeTone'
import styles from './TeamMark.module.css'

type TeamColorStyle = CSSProperties & Record<string, string>

interface TeamMarkProps {
    abbreviation: string
    teamName: string
}

export function TeamMark({ abbreviation, teamName }: TeamMarkProps) {
    const [logoFailed, setLogoFailed] = useState(false)
    const brand = findTeamBrand(abbreviation)

    if (brand && !logoFailed) {
        return (
            <span className={styles.mark}>
                <img
                    className={styles.logo}
                    src={teamLogoUrl(brand)}
                    alt={teamName}
                    loading="lazy"
                    onError={() => setLogoFailed(true)}
                />
            </span>
        )
    }

    const badgeStyle: TeamColorStyle = brand
        ? { '--team-color': brand.color, '--team-text-color': badgeTextColor(brand.color) }
        : {}

    return (
        <span className={`${styles.mark} ${styles.badge}`} style={badgeStyle} role="img" aria-label={teamName}>
            {abbreviation}
        </span>
    )
}
