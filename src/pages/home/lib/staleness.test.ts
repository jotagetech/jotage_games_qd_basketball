import { describe, expect, it } from 'vitest'

import type { Game } from '../model/game'
import { staleMinutes } from './staleness'

const NOW = new Date('2026-10-29T20:00:00.000Z')

function gameSyncedAt(lastSyncedAt: string): Game {
    const team = { id: 1, abbreviation: 'ATL', city: 'Atlanta', name: 'Hawks', fullName: 'Atlanta Hawks' }
    const game: Game = {
        id: 1,
        startsAt: '2026-10-29T23:00:00.000Z',
        status: 'live',
        period: 1,
        clock: '10:00',
        homeTeam: team,
        awayTeam: { ...team, id: 2, abbreviation: 'MIA' },
        homeScore: 0,
        awayScore: 0,
        winnerTeamId: null,
        lastSyncedAt,
    }
    return game
}

describe('staleMinutes', () => {
    it('devolve nulo sem jogos', () => {
        expect(staleMinutes([], NOW)).toBeNull()
    })

    it('devolve nulo quando a sincronização tem 15 minutos ou menos', () => {
        const games = [gameSyncedAt('2026-10-29T19:45:00.000Z')]

        expect(staleMinutes(games, NOW)).toBeNull()
    })

    it('devolve os minutos quando passa de 15', () => {
        const games = [gameSyncedAt('2026-10-29T19:30:00.000Z')]

        expect(staleMinutes(games, NOW)).toBe(30)
    })

    it('usa a sincronização mais recente entre os jogos', () => {
        const games = [gameSyncedAt('2026-10-29T18:00:00.000Z'), gameSyncedAt('2026-10-29T19:55:00.000Z')]

        expect(staleMinutes(games, NOW)).toBeNull()
    })
})
