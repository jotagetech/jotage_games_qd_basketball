import { describe, expect, it } from 'vitest'
import {
    createBalldontlieProvider,
    MAX_PAGES,
    mapGame,
    mapStatus,
    type BalldontlieGame,
} from './balldontlie.ts'
import sample from './__fixtures__/balldontlie-games.sample.json'

const WINDOW = { startDate: '2026-10-28', endDate: '2026-11-05' }

const HOME_TEAM = {
    id: 1,
    abbreviation: 'AAA',
    city: 'Alpha',
    name: 'Alphas',
    full_name: 'Alpha Alphas',
    conference: 'East',
    division: 'Central',
}

const VISITOR_TEAM = {
    id: 2,
    abbreviation: 'BBB',
    city: 'Beta',
    name: 'Betas',
    full_name: 'Beta Betas',
    conference: 'West',
    division: 'Pacific',
}

function buildRawGame(overrides: Partial<BalldontlieGame>): BalldontlieGame {
    const game: BalldontlieGame = {
        id: 1,
        date: '2026-10-28',
        datetime: '2026-10-28T23:00:00.000Z',
        season: 2026,
        postseason: false,
        status_state: 'final',
        period: 4,
        time: 'Final',
        home_team_score: 100,
        visitor_team_score: 90,
        home_q1: 25,
        home_q2: 25,
        home_q3: 25,
        home_q4: 25,
        visitor_q1: 20,
        visitor_q2: 20,
        visitor_q3: 25,
        visitor_q4: 25,
        home_team: HOME_TEAM,
        visitor_team: VISITOR_TEAM,
        ...overrides,
    }
    return game
}

function jsonResponse(body: unknown, status = 200): Response {
    const response = new Response(JSON.stringify(body), { status })
    return response
}

describe('mapStatus', () => {
    it.each([
        ['scheduled', 'scheduled'],
        ['delayed', 'scheduled'],
        ['in_progress', 'live'],
        ['final', 'final'],
        ['postponed', 'postponed'],
        ['suspended', 'postponed'],
        ['canceled', 'canceled'],
        ['abandoned', 'canceled'],
        ['unknown', 'unavailable'],
        ['estado_novo_do_provedor', 'unavailable'],
    ])('%s vira %s', (statusState, expected) => {
        expect(mapStatus(statusState)).toBe(expected)
    })

    it('ausente vira unavailable', () => {
        expect(mapStatus(undefined)).toBe('unavailable')
        expect(mapStatus(null)).toBe('unavailable')
    })
})

describe('mapGame', () => {
    it('mapeia um jogo final da amostra capturada', () => {
        const [firstFinal] = sample.data
        const game = mapGame(firstFinal)

        expect(game.status).toBe('final')
        expect(game.homeScore).toBe(firstFinal.home_team_score)
        expect(game.awayScore).toBe(firstFinal.visitor_team_score)
        expect(game.homePeriodScores).toHaveLength(4)
        expect(game.homeTeam.providerTeamId).toBe(String(firstFinal.home_team.id))
        expect(game.awayTeam.fullName).toBe(firstFinal.visitor_team.full_name)
    })

    it('deixa placar nulo no jogo agendado da amostra', () => {
        const scheduled = sample.data.find(
            (game) => game.status_state === 'scheduled',
        )
        if (!scheduled) throw new Error('amostra sem jogo agendado')

        const game = mapGame(scheduled)

        expect(game.status).toBe('scheduled')
        expect(game.homeScore).toBeNull()
        expect(game.awayScore).toBeNull()
        expect(game.homePeriodScores).toBeNull()
        expect(game.awayPeriodScores).toBeNull()
        expect(game.period).toBeNull()
    })

    it('jogo adiado com placar zerado fica sem placar', () => {
        const game = mapGame(
            buildRawGame({
                status_state: 'postponed',
                period: 0,
                time: null,
                home_team_score: 0,
                visitor_team_score: 0,
                home_q1: null,
                home_q2: null,
                home_q3: null,
                home_q4: null,
                visitor_q1: null,
                visitor_q2: null,
                visitor_q3: null,
                visitor_q4: null,
            }),
        )

        expect(game.status).toBe('postponed')
        expect(game.homeScore).toBeNull()
        expect(game.homePeriodScores).toBeNull()
    })

    it('jogo ao vivo guarda placar parcial, período e relógio', () => {
        const game = mapGame(
            buildRawGame({
                status_state: 'in_progress',
                period: 2,
                time: '5:32',
                home_team_score: 48,
                visitor_team_score: 44,
                home_q1: 25,
                home_q2: 23,
                home_q3: null,
                home_q4: null,
                visitor_q1: 20,
                visitor_q2: 24,
                visitor_q3: null,
                visitor_q4: null,
            }),
        )

        expect(game.status).toBe('live')
        expect(game.homeScore).toBe(48)
        expect(game.period).toBe(2)
        expect(game.clock).toBe('5:32')
        expect(game.homePeriodScores).toEqual([25, 23])
        expect(game.awayPeriodScores).toEqual([20, 24])
    })

    it('inclui as prorrogações não nulas depois dos quartos', () => {
        const game = mapGame(
            buildRawGame({
                period: 6,
                home_team_score: 120,
                visitor_team_score: 118,
                home_ot1: 10,
                home_ot2: 8,
                visitor_ot1: 10,
                visitor_ot2: 6,
            }),
        )

        expect(game.homePeriodScores).toEqual([25, 25, 25, 25, 10, 8])
        expect(game.awayPeriodScores).toEqual([20, 20, 25, 25, 10, 6])
    })
})

describe('createBalldontlieProvider', () => {
    it('segue next_cursor até o fim e conta as requisições', async () => {
        const requestedUrls: string[] = []
        const pages = [
            {
                data: [buildRawGame({ id: 1 })],
                meta: { next_cursor: 55 },
            },
            { data: [buildRawGame({ id: 2 })], meta: {} },
        ]
        const fakeFetch: typeof fetch = async (input) => {
            requestedUrls.push(String(input))
            const page = pages[requestedUrls.length - 1]
            return jsonResponse(page)
        }

        const provider = createBalldontlieProvider('chave-de-teste', fakeFetch)
        const result = await provider.fetchGames(WINDOW)

        expect(result.requestsMade).toBe(2)
        expect(result.games.map((game) => game.providerGameId)).toEqual(['1', '2'])
        expect(requestedUrls[0]).toContain('start_date=2026-10-28')
        expect(requestedUrls[0]).toContain('end_date=2026-11-05')
        expect(requestedUrls[0]).not.toContain('cursor=')
        expect(requestedUrls[1]).toContain('cursor=55')
    })

    it('envia a chave no cabeçalho Authorization', async () => {
        let receivedHeaders: HeadersInit | undefined
        const fakeFetch: typeof fetch = async (_input, init) => {
            receivedHeaders = init?.headers
            return jsonResponse({ data: [], meta: {} })
        }

        const provider = createBalldontlieProvider('chave-de-teste', fakeFetch)
        await provider.fetchGames(WINDOW)

        expect(receivedHeaders).toEqual({ Authorization: 'chave-de-teste' })
    })

    it('falha quando o provedor responde com erro', async () => {
        const fakeFetch: typeof fetch = async () => jsonResponse({}, 429)

        const provider = createBalldontlieProvider('chave-de-teste', fakeFetch)

        await expect(provider.fetchGames(WINDOW)).rejects.toThrow('429')
    })

    it('para com erro quando o cursor nunca acaba', async () => {
        let calls = 0
        const fakeFetch: typeof fetch = async () => {
            calls += 1
            return jsonResponse({ data: [], meta: { next_cursor: calls } })
        }

        const provider = createBalldontlieProvider('chave-de-teste', fakeFetch)

        await expect(provider.fetchGames(WINDOW)).rejects.toThrow('páginas')
        expect(calls).toBe(MAX_PAGES)
    })
})
