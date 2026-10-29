import type { Viewer } from '@/entities/viewer'

import { formatWinRate, isViewerEntry } from '../../lib/rankingFormat'
import type { RankingState } from '../../model/useRanking'
import styles from './RankingTable.module.css'

interface RankingTableProps {
    state: RankingState
    viewer: Viewer
    onRetry: () => void
}

export function RankingTable({ state, viewer, onRetry }: RankingTableProps) {
    if (state.phase === 'loading') {
        return (
            <section className={styles.section} aria-busy="true">
                <p className={styles.srOnly} role="status">
                    Carregando ranking
                </p>
                <div className={styles.skeleton} aria-hidden="true" />
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
                <p>Não foi possível carregar o ranking.</p>
                <button type="button" className={styles.retry} onClick={onRetry}>
                    Tentar de novo
                </button>
            </div>
        )
    }

    if (state.entries.length === 0) {
        return <p className={styles.message}>Ainda não há palpites julgados.</p>
    }

    return (
        <section className={styles.section}>
            <h2 className={styles.heading}>Ranking</h2>
            <div className={styles.wrapper}>
                <table className={styles.table}>
                    <caption className={styles.srOnly}>Ranking de acertos e erros</caption>
                    <thead>
                        <tr>
                            <th scope="col">Posição</th>
                            <th scope="col">Apelido</th>
                            <th scope="col">Acertos</th>
                            <th scope="col">Erros</th>
                            <th scope="col">%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.entries.map((entry) => {
                            const isViewer = isViewerEntry(entry, viewer)
                            return (
                                <tr key={entry.username} className={isViewer ? styles.viewer : undefined}>
                                    <th scope="row">{entry.position}</th>
                                    <td>
                                        <span className={styles.username}>{entry.username}</span>
                                        {isViewer && <span className={styles.viewerTag}>(você)</span>}
                                    </td>
                                    <td>{entry.wins}</td>
                                    <td>{entry.losses}</td>
                                    <td>{formatWinRate(entry.winRate)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    )
}
