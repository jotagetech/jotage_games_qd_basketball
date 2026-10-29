import { useState } from 'react'

import { useViewer } from '@/entities/viewer'
import { addDays, defaultRoundDate, formatDateLabel } from '@/shared/lib/date'

import { buildDateSearch, readDateParam } from '../lib/dateParam'
import { useGames } from '../model/useGames'
import { usePicks } from '../model/usePicks'
import { DateNav } from './DateNav/DateNav'
import { GameList } from './GameList/GameList'
import styles from './HomePage.module.css'
import { ViewerMenu } from './ViewerMenu/ViewerMenu'

function currentSearch(): string {
    const search = typeof window === 'undefined' ? '' : window.location.search
    return search
}

function initialRoundDate(): string {
    const date = readDateParam(currentSearch(), defaultRoundDate(new Date()))
    return date
}

export function HomePage() {
    const [roundDate, setRoundDate] = useState(initialRoundDate)
    const { state, reload, refresh } = useGames(roundDate)
    const viewer = useViewer()
    const pickBoard = usePicks(viewer, state, refresh)

    function selectDate(date: string) {
        setRoundDate(date)
        window.history.replaceState(null, '', buildDateSearch(date))
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <img
                    className={styles.logo}
                    src="/brand/quadruplo-duplo.png"
                    alt="Quádruplo Duplo"
                    width={48}
                    height={48}
                />
                <h1 className={styles.title}>QD Basketball</h1>
                <ViewerMenu viewer={viewer} />
            </header>
            <DateNav
                label={formatDateLabel(roundDate)}
                onPrevious={() => selectDate(addDays(roundDate, -1))}
                onNext={() => selectDate(addDays(roundDate, 1))}
                onToday={() => selectDate(defaultRoundDate(new Date()))}
            />
            <main className={styles.content}>
                <GameList state={state} now={new Date()} onRetry={reload} pickBoard={pickBoard} />
            </main>
        </div>
    )
}
