import type { Game } from '../model/game'

export const STALE_AFTER_MINUTES = 15
const MS_PER_MINUTE = 60_000

export function staleMinutes(games: readonly Game[], now: Date): number | null {
    if (games.length === 0) {
        return null
    }

    const syncTimes = games.map((game) => new Date(game.lastSyncedAt).getTime())
    const latestSync = Math.max(...syncTimes)
    const elapsedMinutes = Math.floor((now.getTime() - latestSync) / MS_PER_MINUTE)
    const minutes = elapsedMinutes > STALE_AFTER_MINUTES ? elapsedMinutes : null
    return minutes
}
