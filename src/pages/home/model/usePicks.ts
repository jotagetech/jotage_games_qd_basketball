import { useCallback, useEffect, useState } from 'react'

import type { Viewer } from '@/entities/viewer'

import { fetchPicks, type PicksByGame, savePick } from '../api/picks'
import { translatePickError } from '../lib/pickError'
import type { PickBoard, PickOutcome } from './pickBoard'
import type { GamesState } from './useGames'

interface LoadedPicks {
    userId: string
    gameKey: string
    picks: PicksByGame
    failed: boolean
}

function gameKeyOf(state: GamesState): string | null {
    if (state.phase !== 'ready') {
        return null
    }

    const key = state.games.map((game) => game.id).join(',')
    return key
}

function idsOf(gameKey: string): number[] {
    const ids = gameKey === '' ? [] : gameKey.split(',').map(Number)
    return ids
}

function deriveBoard(
    viewer: Viewer,
    gameKey: string | null,
    loaded: LoadedPicks | null,
    choose: (gameId: number, teamId: number) => Promise<PickOutcome>,
): PickBoard {
    if (viewer.phase === 'loading') {
        return { phase: 'loading' }
    }

    if (viewer.phase === 'anonymous') {
        return { phase: 'anonymous' }
    }

    const current = loaded && loaded.userId === viewer.userId && loaded.gameKey === gameKey
    if (!loaded || !current) {
        return { phase: 'loading' }
    }

    if (loaded.failed) {
        return { phase: 'unavailable' }
    }

    return { phase: 'ready', picksByGame: loaded.picks, choose }
}

export function usePicks(viewer: Viewer, gamesState: GamesState, onClosed: () => void): PickBoard {
    const [loaded, setLoaded] = useState<LoadedPicks | null>(null)
    const userId = viewer.phase === 'signed-in' ? viewer.userId : null
    const gameKey = gameKeyOf(gamesState)

    useEffect(() => {
        if (userId === null || gameKey === null) {
            return undefined
        }

        let cancelled = false
        fetchPicks(userId, idsOf(gameKey))
            .then((picks) => !cancelled && setLoaded({ userId, gameKey, picks, failed: false }))
            .catch(() => !cancelled && setLoaded({ userId, gameKey, picks: {}, failed: true }))

        return () => {
            cancelled = true
        }
    }, [userId, gameKey])

    const choose = useCallback(
        async (gameId: number, teamId: number): Promise<PickOutcome> => {
            if (userId === null) {
                return { kind: 'failed', ...translatePickError(null) }
            }

            try {
                await savePick(userId, gameId, teamId)
            } catch (error) {
                const failure = translatePickError(error)
                if (failure.closed) {
                    onClosed()
                }
                return { kind: 'failed', ...failure }
            }

            setLoaded((current) => {
                const next = current && { ...current, picks: { ...current.picks, [gameId]: teamId } }
                return next
            })
            return { kind: 'saved' }
        },
        [userId, onClosed],
    )

    const board = deriveBoard(viewer, gameKey, loaded, choose)
    return board
}
