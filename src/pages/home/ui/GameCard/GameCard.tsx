import { hasScoreboard, statusLabel } from '../../lib/gameStatus'
import type { Game } from '../../model/game'
import type { Team } from '../../model/team'
import { TeamMark } from '../TeamMark/TeamMark'
import styles from './GameCard.module.css'
import { StatusIcon } from './StatusIcon'

interface TeamLineProps {
    team: Team
    score: number | null
    outcome: 'winner' | 'loser' | 'undecided'
}

interface GameCardProps {
    game: Game
}

function resolveOutcome(game: Game, team: Team): TeamLineProps['outcome'] {
    if (game.status !== 'final' || game.winnerTeamId === null) {
        return 'undecided'
    }

    const outcome = game.winnerTeamId === team.id ? 'winner' : 'loser'
    return outcome
}

function TeamLine({ team, score, outcome }: TeamLineProps) {
    const lineClass = outcome === 'undecided' ? styles.team : `${styles.team} ${styles[outcome]}`

    return (
        <div className={lineClass}>
            <TeamMark abbreviation={team.abbreviation} teamName={team.fullName} />
            <div className={styles.identity}>
                <span className={styles.abbreviation}>{team.abbreviation}</span>
                <span className={styles.name}>{team.name}</span>
            </div>
            {outcome === 'winner' && <span className={styles.srOnly}>venceu</span>}
            {score !== null && <span className={styles.score}>{score}</span>}
        </div>
    )
}

export function GameCard({ game }: GameCardProps) {
    const showScore = hasScoreboard(game.status)
    const awayScore = showScore ? game.awayScore : null
    const homeScore = showScore ? game.homeScore : null
    const statusClass = game.status === 'live' ? `${styles.status} ${styles.live}` : styles.status

    return (
        <li className={styles.card}>
            <TeamLine team={game.awayTeam} score={awayScore} outcome={resolveOutcome(game, game.awayTeam)} />
            <TeamLine team={game.homeTeam} score={homeScore} outcome={resolveOutcome(game, game.homeTeam)} />
            <p className={statusClass}>
                <StatusIcon status={game.status} />
                {statusLabel(game)}
            </p>
        </li>
    )
}
