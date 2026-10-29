import { describe, expect, it } from 'vitest'

import type { Game } from '../model/game'
import { isPickOpen, pickSituation } from './pickSituation'

const HOME_TEAM_ID = 1
const AWAY_TEAM_ID = 16
const BEFORE_START = new Date('2026-10-29T22:00:00.000Z')
const AFTER_START = new Date('2026-10-30T00:00:00.000Z')

function buildGame(overrides: Partial<Game>): Game {
    const game: Game = {
        id: 1,
        startsAt: '2026-10-29T23:00:00.000Z',
        status: 'scheduled',
        period: null,
        clock: null,
        homeTeam: { id: HOME_TEAM_ID, abbreviation: 'ATL', city: 'Atlanta', name: 'Hawks', fullName: 'Atlanta Hawks' },
        awayTeam: { id: AWAY_TEAM_ID, abbreviation: 'MIA', city: 'Miami', name: 'Heat', fullName: 'Miami Heat' },
        homeScore: null,
        awayScore: null,
        winnerTeamId: null,
        lastSyncedAt: '2026-10-29T20:00:00.000Z',
        ...overrides,
    }
    return game
}

describe('isPickOpen', () => {
    it('aceita palpite em jogo agendado antes do início', () => {
        expect(isPickOpen(buildGame({}), BEFORE_START)).toBe(true)
    })

    it('fecha no instante do início', () => {
        const atStart = new Date('2026-10-29T23:00:00.000Z')

        expect(isPickOpen(buildGame({}), atStart)).toBe(false)
    })

    it('fecha depois do início mesmo com o status ainda agendado', () => {
        expect(isPickOpen(buildGame({}), AFTER_START)).toBe(false)
    })

    it('fecha quando o status não é agendado, mesmo antes do horário', () => {
        expect(isPickOpen(buildGame({ status: 'postponed' }), BEFORE_START)).toBe(false)
        expect(isPickOpen(buildGame({ status: 'live' }), BEFORE_START)).toBe(false)
    })
})

describe('pickSituation', () => {
    it('é aberto antes do início, com ou sem palpite', () => {
        expect(pickSituation(buildGame({}), null, BEFORE_START)).toBe('open')
        expect(pickSituation(buildGame({}), HOME_TEAM_ID, BEFORE_START)).toBe('open')
    })

    it('é sem palpite quando o jogo já fechou e ninguém foi escolhido', () => {
        expect(pickSituation(buildGame({ status: 'live' }), null, AFTER_START)).toBe('none')
    })

    it('é travado enquanto o jogo não terminou', () => {
        expect(pickSituation(buildGame({ status: 'live' }), HOME_TEAM_ID, AFTER_START)).toBe('locked')
        expect(pickSituation(buildGame({}), HOME_TEAM_ID, AFTER_START)).toBe('locked')
    })

    it('é travado no jogo final sem vencedor definido', () => {
        expect(pickSituation(buildGame({ status: 'final' }), HOME_TEAM_ID, AFTER_START)).toBe('locked')
    })

    it('é acertou quando o time escolhido venceu', () => {
        const game = buildGame({ status: 'final', winnerTeamId: AWAY_TEAM_ID })

        expect(pickSituation(game, AWAY_TEAM_ID, AFTER_START)).toBe('won')
    })

    it('é errou quando o outro time venceu', () => {
        const game = buildGame({ status: 'final', winnerTeamId: AWAY_TEAM_ID })

        expect(pickSituation(game, HOME_TEAM_ID, AFTER_START)).toBe('lost')
    })
})
