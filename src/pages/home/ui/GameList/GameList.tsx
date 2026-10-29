import { staleMinutes } from '../../lib/staleness'
import type { GamesState } from '../../model/useGames'
import { GameCard } from '../GameCard/GameCard'
import styles from './GameList.module.css'

const SKELETON_COUNT = 4
const SKELETON_KEYS = Array.from({ length: SKELETON_COUNT }, (_, index) => `skeleton-${index}`)

interface GameListProps {
    state: GamesState
    now: Date
    onRetry: () => void
}

export function GameList({ state, now, onRetry }: GameListProps) {
    if (state.phase === 'loading') {
        return (
            <section className={styles.section} aria-busy="true">
                <p className={styles.srOnly} role="status">
                    Carregando jogos
                </p>
                <ul className={styles.list} aria-hidden="true">
                    {SKELETON_KEYS.map((key) => (
                        <li key={key} className={styles.skeleton} />
                    ))}
                </ul>
            </section>
        )
    }

    if (state.phase === 'error' && state.reason === 'config') {
        return (
            <p className={styles.message} role="alert">
                A conexão com o banco de dados não está configurada. Avise quem mantém o site.
            </p>
        )
    }

    if (state.phase === 'error') {
        return (
            <div className={styles.message} role="alert">
                <p>Não foi possível carregar os jogos.</p>
                <button type="button" className={styles.retry} onClick={onRetry}>
                    Tentar de novo
                </button>
            </div>
        )
    }

    if (state.games.length === 0) {
        return <p className={styles.message}>Nenhum jogo nesta data.</p>
    }

    const minutesStale = staleMinutes(state.games, now)

    return (
        <section className={styles.section}>
            <div className={styles.notes}>
                <p>Horários de Brasília</p>
                {minutesStale !== null && (
                    <p className={styles.stale} role="status">
                        Placar atualizado há {minutesStale} min; pode estar atrasado.
                    </p>
                )}
            </div>
            <ul className={styles.list}>
                {state.games.map((game) => (
                    <GameCard key={game.id} game={game} />
                ))}
            </ul>
        </section>
    )
}
