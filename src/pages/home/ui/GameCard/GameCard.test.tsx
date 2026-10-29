import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { Game } from '../../model/game'
import { GameCard } from './GameCard'

const AWAY_TEAM = { id: 16, abbreviation: 'MIA', city: 'Miami', name: 'Heat', fullName: 'Miami Heat' }
const HOME_TEAM = { id: 1, abbreviation: 'ATL', city: 'Atlanta', name: 'Hawks', fullName: 'Atlanta Hawks' }

function buildGame(overrides: Partial<Game>): Game {
    const game: Game = {
        id: 1,
        startsAt: '2026-10-29T23:00:00.000Z',
        status: 'scheduled',
        period: null,
        clock: null,
        homeTeam: HOME_TEAM,
        awayTeam: AWAY_TEAM,
        homeScore: null,
        awayScore: null,
        winnerTeamId: null,
        lastSyncedAt: '2026-10-29T20:00:00.000Z',
        ...overrides,
    }
    return game
}

function render(game: Game): string {
    const markup = renderToStaticMarkup(<GameCard game={game} />)
    return markup
}

describe('GameCard', () => {
    it('caso de teste: jogo agendado mostra o horário e nenhum placar', () => {
        const markup = render(buildGame({ status: 'scheduled' }))

        expect(markup).toContain('20:00')
        expect(markup).not.toContain('venceu')
        expect(markup).not.toMatch(/>\d+<\/span><\/div>/)
    })

    it('caso de teste: jogo ao vivo mostra placar, período e relógio', () => {
        const markup = render(
            buildGame({ status: 'live', period: 3, clock: '4:21', homeScore: 80, awayScore: 77 }),
        )

        expect(markup).toContain('3º quarto, 4:21')
        expect(markup).toContain('>80<')
        expect(markup).toContain('>77<')
        expect(markup).not.toContain('venceu')
    })

    it('caso de teste: jogo encerrado destaca o vencedor por texto', () => {
        const markup = render(
            buildGame({ status: 'final', period: 4, homeScore: 117, awayScore: 129, winnerTeamId: AWAY_TEAM.id }),
        )

        expect(markup).toContain('Final')
        expect(markup).toContain('>129<')
        expect(markup.match(/venceu/g)).toHaveLength(1)
    })

    it('caso de teste: jogo adiado mostra o estado sem placar', () => {
        const markup = render(buildGame({ status: 'postponed' }))

        expect(markup).toContain('Adiado')
        expect(markup).not.toContain('venceu')
    })

    it('mostra o visitante antes do mandante', () => {
        const markup = render(buildGame({}))

        expect(markup.indexOf('MIA')).toBeLessThan(markup.indexOf('ATL'))
    })
})
