import { describe, expect, it } from 'vitest'

import type { Game } from '../model/game'
import { hasScoreboard, periodLabel, statusLabel } from './gameStatus'

function gameWith(overrides: Partial<Game>): Game {
    const game: Game = {
        id: 1,
        startsAt: '2026-10-29T23:00:00.000Z',
        status: 'scheduled',
        period: null,
        clock: null,
        homeTeam: { id: 1, abbreviation: 'ATL', city: 'Atlanta', name: 'Hawks', fullName: 'Atlanta Hawks' },
        awayTeam: { id: 2, abbreviation: 'MIA', city: 'Miami', name: 'Heat', fullName: 'Miami Heat' },
        homeScore: null,
        awayScore: null,
        winnerTeamId: null,
        lastSyncedAt: '2026-10-29T20:00:00.000Z',
        ...overrides,
    }
    return game
}

describe('periodLabel', () => {
    it('nomeia os quatro quartos', () => {
        expect(periodLabel(1)).toBe('1º quarto')
        expect(periodLabel(4)).toBe('4º quarto')
    })

    it('nomeia as prorrogações', () => {
        expect(periodLabel(5)).toBe('Prorrogação')
        expect(periodLabel(6)).toBe('2ª prorrogação')
    })
})

describe('hasScoreboard', () => {
    it('só mostra placar com jogo ao vivo ou encerrado', () => {
        expect(hasScoreboard('live')).toBe(true)
        expect(hasScoreboard('final')).toBe(true)
        expect(hasScoreboard('scheduled')).toBe(false)
        expect(hasScoreboard('postponed')).toBe(false)
    })
})

describe('statusLabel', () => {
    it('mostra o horário de Brasília para jogo agendado', () => {
        expect(statusLabel(gameWith({ status: 'scheduled' }))).toBe('20:00')
    })

    it('mostra período e relógio para jogo ao vivo', () => {
        const game = gameWith({ status: 'live', period: 3, clock: '4:21' })

        expect(statusLabel(game)).toBe('3º quarto, 4:21')
    })

    it('mostra só o período quando o relógio não é um tempo', () => {
        const game = gameWith({ status: 'live', period: 3, clock: null })

        expect(statusLabel(game)).toBe('3º quarto')
    })

    it('mostra intervalo', () => {
        const game = gameWith({ status: 'live', period: 2, clock: 'Halftime' })

        expect(statusLabel(game)).toBe('Intervalo')
    })

    it('mostra prorrogação ao vivo', () => {
        const game = gameWith({ status: 'live', period: 5, clock: '2:05' })

        expect(statusLabel(game)).toBe('Prorrogação, 2:05')
    })

    it('mostra Final e Final na prorrogação', () => {
        expect(statusLabel(gameWith({ status: 'final', period: 4 }))).toBe('Final')
        expect(statusLabel(gameWith({ status: 'final', period: 5 }))).toBe('Final na prorrogação')
    })

    it('nomeia adiado, cancelado e indisponível', () => {
        expect(statusLabel(gameWith({ status: 'postponed' }))).toBe('Adiado')
        expect(statusLabel(gameWith({ status: 'canceled' }))).toBe('Cancelado')
        expect(statusLabel(gameWith({ status: 'unavailable' }))).toBe('Indisponível')
    })
})
