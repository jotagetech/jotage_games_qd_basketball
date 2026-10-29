import type {
    FetchGamesResult,
    GameProvider,
    GameStatus,
    GameWindow,
    ProviderGame,
    ProviderTeam,
} from './types.ts'

const BASE_URL = 'https://api.balldontlie.io/v1'
const PAGE_SIZE = 100
const PROVIDER_NAME = 'balldontlie'

export interface BalldontlieTeam {
    id: number
    abbreviation: string
    city?: string | null
    name: string
    full_name: string
    conference?: string | null
    division?: string | null
}

export interface BalldontlieGame {
    id: number
    date: string
    datetime: string
    season: number
    postseason: boolean
    status_state?: string | null
    period?: number | null
    time?: string | null
    home_team_score: number
    visitor_team_score: number
    home_q1?: number | null
    home_q2?: number | null
    home_q3?: number | null
    home_q4?: number | null
    home_ot1?: number | null
    home_ot2?: number | null
    home_ot3?: number | null
    visitor_q1?: number | null
    visitor_q2?: number | null
    visitor_q3?: number | null
    visitor_q4?: number | null
    visitor_ot1?: number | null
    visitor_ot2?: number | null
    visitor_ot3?: number | null
    home_team: BalldontlieTeam
    visitor_team: BalldontlieTeam
}

interface BalldontlieGamesPage {
    data: BalldontlieGame[]
    meta?: { next_cursor?: number | null }
}

const STATUS_BY_STATE: Record<string, GameStatus> = {
    scheduled: 'scheduled',
    delayed: 'scheduled',
    in_progress: 'live',
    final: 'final',
    postponed: 'postponed',
    suspended: 'postponed',
    canceled: 'canceled',
    abandoned: 'canceled',
}

export function mapStatus(statusState: string | null | undefined): GameStatus {
    const mapped = statusState ? STATUS_BY_STATE[statusState] : undefined
    const status = mapped ?? 'unavailable'
    return status
}

function mapTeam(team: BalldontlieTeam): ProviderTeam {
    const mapped = {
        providerTeamId: String(team.id),
        abbreviation: team.abbreviation,
        city: team.city ?? null,
        name: team.name,
        fullName: team.full_name,
        conference: team.conference ?? null,
        division: team.division ?? null,
    }
    return mapped
}

function collectPeriodScores(
    scores: Array<number | null | undefined>,
): number[] | null {
    const played = scores.filter((score): score is number => score != null)
    const periodScores = played.length > 0 ? played : null
    return periodScores
}

function hasScoreboard(status: GameStatus): boolean {
    const result = status === 'live' || status === 'final'
    return result
}

export function mapGame(game: BalldontlieGame): ProviderGame {
    const status = mapStatus(game.status_state)
    const started = hasScoreboard(status)

    const homePeriodScores = collectPeriodScores([
        game.home_q1,
        game.home_q2,
        game.home_q3,
        game.home_q4,
        game.home_ot1,
        game.home_ot2,
        game.home_ot3,
    ])
    const awayPeriodScores = collectPeriodScores([
        game.visitor_q1,
        game.visitor_q2,
        game.visitor_q3,
        game.visitor_q4,
        game.visitor_ot1,
        game.visitor_ot2,
        game.visitor_ot3,
    ])

    const mapped = {
        providerGameId: String(game.id),
        season: game.season,
        postseason: game.postseason,
        nbaDate: game.date,
        startsAt: game.datetime,
        homeTeam: mapTeam(game.home_team),
        awayTeam: mapTeam(game.visitor_team),
        status,
        period: started ? (game.period ?? null) : null,
        clock: started ? (game.time ?? null) : null,
        homeScore: started ? game.home_team_score : null,
        awayScore: started ? game.visitor_team_score : null,
        homePeriodScores: started ? homePeriodScores : null,
        awayPeriodScores: started ? awayPeriodScores : null,
    }
    return mapped
}

function buildPageUrl(window: GameWindow, cursor: number | null): string {
    const params = new URLSearchParams({
        start_date: window.startDate,
        end_date: window.endDate,
        per_page: String(PAGE_SIZE),
    })
    if (cursor !== null) {
        params.set('cursor', String(cursor))
    }
    const url = `${BASE_URL}/games?${params.toString()}`
    return url
}

// A janela inteira cabe em duas páginas; o teto evita laço infinito e
// estouro do limite do plano grátis se o provedor repetir o cursor.
export const MAX_PAGES = 3

export function createBalldontlieProvider(
    apiKey: string,
    fetchFn: typeof fetch,
): GameProvider {
    async function fetchPage(
        window: GameWindow,
        cursor: number | null,
    ): Promise<BalldontlieGamesPage> {
        const response = await fetchFn(buildPageUrl(window, cursor), {
            headers: { Authorization: apiKey },
        })
        if (!response.ok) {
            throw new Error(`BALLDONTLIE respondeu ${response.status}`)
        }
        const page: BalldontlieGamesPage = await response.json()
        return page
    }

    async function fetchGames(window: GameWindow): Promise<FetchGamesResult> {
        const games: ProviderGame[] = []
        let requestsMade = 0
        let cursor: number | null = null

        do {
            if (requestsMade >= MAX_PAGES) {
                throw new Error(`BALLDONTLIE passou de ${MAX_PAGES} páginas`)
            }
            const page = await fetchPage(window, cursor)
            requestsMade += 1
            games.push(...page.data.map(mapGame))
            cursor = page.meta?.next_cursor ?? null
        } while (cursor !== null)

        const result = { games, requestsMade }
        return result
    }

    const provider = { name: PROVIDER_NAME, fetchGames }
    return provider
}
