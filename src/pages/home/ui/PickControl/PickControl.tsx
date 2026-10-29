import { useState } from 'react'
import { Link } from 'react-router-dom'

import { pickSituation } from '../../lib/pickSituation'
import type { Game } from '../../model/game'
import type { PickBoard } from '../../model/pickBoard'
import type { Team } from '../../model/team'
import styles from './PickControl.module.css'

const CHECK_PATH = 'M5 12.5l4.5 4.5L19 7.5'
const CROSS_PATH = 'M6 6l12 12M18 6L6 18'

type Submission = { phase: 'idle' } | { phase: 'saving' } | { phase: 'saved' } | { phase: 'failed'; message: string }

const IDLE: Submission = { phase: 'idle' }
const SAVING: Submission = { phase: 'saving' }
const SAVED: Submission = { phase: 'saved' }

interface PickControlProps {
    game: Game
    now: Date
    board: PickBoard
}

interface MarkProps {
    path: string
}

function Mark({ path }: MarkProps) {
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
            <path d={path} />
        </svg>
    )
}

function findTeam(game: Game, teamId: number | null): Team | null {
    const team = [game.awayTeam, game.homeTeam].find((candidate) => candidate.id === teamId)
    return team ?? null
}

function Feedback({ submission }: { submission: Submission }) {
    if (submission.phase === 'saved') {
        return (
            <p className={styles.feedback} role="status">
                <Mark path={CHECK_PATH} />
                Palpite salvo
            </p>
        )
    }

    if (submission.phase === 'failed') {
        return (
            <p className={`${styles.feedback} ${styles.error}`} role="alert">
                <Mark path={CROSS_PATH} />
                {submission.message}
            </p>
        )
    }

    return null
}

export function PickControl({ game, now, board }: PickControlProps) {
    const [submission, setSubmission] = useState<Submission>(IDLE)

    if (board.phase === 'loading' || board.phase === 'unavailable') {
        return null
    }

    if (board.phase === 'anonymous') {
        if (pickSituation(game, null, now) !== 'open') {
            return null
        }

        return (
            <p className={styles.prompt}>
                <Link className={styles.signIn} to="/login">
                    Entre para dar seu palpite
                </Link>
            </p>
        )
    }

    const { choose, picksByGame } = board
    const pickedTeamId = picksByGame[game.id] ?? null
    const situation = pickSituation(game, pickedTeamId, now)
    const pickedTeam = findTeam(game, pickedTeamId)

    async function select(teamId: number) {
        if (teamId === pickedTeamId) {
            return
        }

        setSubmission(SAVING)
        const outcome = await choose(game.id, teamId)
        const next: Submission = outcome.kind === 'saved' ? SAVED : { phase: 'failed', message: outcome.message }
        setSubmission(next)
    }

    if (situation === 'open') {
        const saving = submission.phase === 'saving'
        const prompt = pickedTeam ? `Seu palpite: ${pickedTeam.name}` : 'Escolha o vencedor'

        return (
            <div className={styles.pick}>
                <p className={styles.prompt}>{prompt}</p>
                <div className={styles.choices}>
                    {[game.awayTeam, game.homeTeam].map((team) => {
                        const selected = team.id === pickedTeamId

                        return (
                            <button
                                key={team.id}
                                type="button"
                                className={styles.choice}
                                aria-pressed={selected}
                                disabled={saving}
                                onClick={() => select(team.id)}
                            >
                                {selected && <Mark path={CHECK_PATH} />}
                                {team.name}
                            </button>
                        )
                    })}
                </div>
                <Feedback submission={submission} />
            </div>
        )
    }

    if (pickedTeam === null) {
        return (
            <div className={styles.pick}>
                <p className={`${styles.result} ${styles.muted}`}>Sem palpite</p>
                <Feedback submission={submission} />
            </div>
        )
    }

    return (
        <div className={styles.pick}>
            <p className={styles.result}>Seu palpite: {pickedTeam.name}</p>
            {situation === 'won' && (
                <p className={`${styles.result} ${styles.won}`}>
                    <Mark path={CHECK_PATH} />
                    Acertou
                </p>
            )}
            {situation === 'lost' && (
                <p className={`${styles.result} ${styles.lost}`}>
                    <Mark path={CROSS_PATH} />
                    Errou
                </p>
            )}
            <Feedback submission={submission} />
        </div>
    )
}
