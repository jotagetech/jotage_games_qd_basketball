import type { Team } from './team'

export type GameStatus = 'scheduled' | 'live' | 'final' | 'postponed' | 'canceled' | 'unavailable'

export interface Game {
    id: number
    startsAt: string
    status: GameStatus
    period: number | null
    clock: string | null
    homeTeam: Team
    awayTeam: Team
    homeScore: number | null
    awayScore: number | null
    winnerTeamId: number | null
    lastSyncedAt: string
}
