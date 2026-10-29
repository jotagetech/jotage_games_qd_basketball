import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { Game } from '../../model/game'
import type { GamesState } from '../../model/useGames'
import { GameList } from './GameList'

const NOW = new Date('2026-10-29T20:00:00.000Z')

function buildGame(lastSyncedAt: string): Game {
    const game: Game = {
        id: 1,
        startsAt: '2026-10-29T23:00:00.000Z',
        status: 'scheduled',
        period: null,
        clock: null,
        homeTeam: { id: 1, abbreviation: 'ATL', city: 'Atlanta', name: 'Hawks', fullName: 'Atlanta Hawks' },
        awayTeam: { id: 16, abbreviation: 'MIA', city: 'Miami', name: 'Heat', fullName: 'Miami Heat' },
        homeScore: null,
        awayScore: null,
        winnerTeamId: null,
        lastSyncedAt,
    }
    return game
}

function render(state: GamesState): string {
    const markup = renderToStaticMarkup(<GameList state={state} now={NOW} onRetry={() => undefined} />)
    return markup
}

describe('GameList', () => {
    it('mostra o esqueleto enquanto carrega', () => {
        const markup = render({ phase: 'loading' })

        expect(markup).toContain('Carregando jogos')
        expect(markup).toContain('aria-busy="true"')
    })

    it('mostra o estado vazio', () => {
        expect(render({ phase: 'ready', games: [] })).toContain('Nenhum jogo nesta data.')
    })

    it('mostra o erro com a ação de tentar de novo', () => {
        const markup = render({ phase: 'error', reason: 'request' })

        expect(markup).toContain('Não foi possível carregar os jogos.')
        expect(markup).toContain('Tentar de novo')
    })

    it('mostra a configuração ausente sem ação de tentar de novo', () => {
        const markup = render({ phase: 'error', reason: 'config' })

        expect(markup).toContain('não está configurada')
        expect(markup).not.toContain('Tentar de novo')
    })

    it('mostra os jogos com o aviso de fuso e sem aviso de atraso quando o dado é recente', () => {
        const markup = render({ phase: 'ready', games: [buildGame('2026-10-29T19:55:00.000Z')] })

        expect(markup).toContain('Horários de Brasília')
        expect(markup).toContain('ATL')
        expect(markup).not.toContain('pode estar atrasado')
    })

    it('avisa quando o placar está desatualizado', () => {
        const markup = render({ phase: 'ready', games: [buildGame('2026-10-29T19:30:00.000Z')] })

        expect(markup).toContain('Placar atualizado há 30 min; pode estar atrasado.')
    })
})
