import { useCallback, useEffect, useState } from 'react'

import { MissingSupabaseConfigError } from '@/shared/api'

import { fetchGamesByDate } from '../api/fetchGamesByDate'
import type { Game } from './game'

export const LIVE_REFRESH_MS = 60_000

export type GamesState =
    | { phase: 'loading' }
    | { phase: 'ready'; games: Game[] }
    | { phase: 'error'; reason: 'config' | 'request' }

const LOADING: GamesState = { phase: 'loading' }

function failureOf(error: unknown): GamesState {
    const reason = error instanceof MissingSupabaseConfigError ? 'config' : 'request'
    return { phase: 'error', reason }
}

function hasLiveGame(state: GamesState): boolean {
    const live = state.phase === 'ready' && state.games.some((game) => game.status === 'live')
    return live
}

export function useGames(roundDate: string) {
    const [state, setState] = useState<GamesState>(LOADING)
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        let cancelled = false
        setState(LOADING)

        fetchGamesByDate(roundDate)
            .then((games) => !cancelled && setState({ phase: 'ready', games }))
            .catch((error: unknown) => !cancelled && setState(failureOf(error)))

        return () => {
            cancelled = true
        }
    }, [roundDate, attempt])

    const live = hasLiveGame(state)

    useEffect(() => {
        if (!live) {
            return undefined
        }

        let cancelled = false
        const timer = setInterval(() => {
            fetchGamesByDate(roundDate)
                .then((games) => !cancelled && setState({ phase: 'ready', games }))
                .catch(() => undefined)
        }, LIVE_REFRESH_MS)

        return () => {
            cancelled = true
            clearInterval(timer)
        }
    }, [live, roundDate])

    const reload = useCallback(() => setAttempt((current) => current + 1), [])

    return { state, reload }
}
