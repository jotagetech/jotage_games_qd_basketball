export type GameStatus =
    | 'scheduled'
    | 'live'
    | 'final'
    | 'postponed'
    | 'canceled'
    | 'unavailable'

export interface ProviderTeam {
    providerTeamId: string
    abbreviation: string
    city: string | null
    name: string
    fullName: string
    conference: string | null
    division: string | null
}

export interface ProviderGame {
    providerGameId: string
    season: number
    postseason: boolean
    nbaDate: string
    startsAt: string
    homeTeam: ProviderTeam
    awayTeam: ProviderTeam
    status: GameStatus
    period: number | null
    clock: string | null
    homeScore: number | null
    awayScore: number | null
    homePeriodScores: number[] | null
    awayPeriodScores: number[] | null
}

export interface GameWindow {
    startDate: string
    endDate: string
}

export interface FetchGamesResult {
    games: ProviderGame[]
    requestsMade: number
}

export interface GameProvider {
    name: string
    fetchGames(window: GameWindow): Promise<FetchGamesResult>
}
