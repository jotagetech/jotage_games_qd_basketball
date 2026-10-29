import { useCallback, useEffect, useState } from 'react'

import { MissingSupabaseConfigError } from '@/shared/api'

import { fetchRanking } from '../api/fetchRanking'
import type { RankingEntry } from './rankingEntry'

export type RankingState =
    | { phase: 'loading' }
    | { phase: 'ready'; entries: RankingEntry[] }
    | { phase: 'error'; reason: 'config' | 'request' }

const LOADING: RankingState = { phase: 'loading' }

function failureOf(error: unknown): RankingState {
    const reason = error instanceof MissingSupabaseConfigError ? 'config' : 'request'
    return { phase: 'error', reason }
}

export function useRanking() {
    const [state, setState] = useState<RankingState>(LOADING)
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        let cancelled = false
        setState(LOADING)

        fetchRanking()
            .then((entries) => !cancelled && setState({ phase: 'ready', entries }))
            .catch((error: unknown) => !cancelled && setState(failureOf(error)))

        return () => {
            cancelled = true
        }
    }, [attempt])

    const reload = useCallback(() => setAttempt((current) => current + 1), [])

    return { state, reload }
}
