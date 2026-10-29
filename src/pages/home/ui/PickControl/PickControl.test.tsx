import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import type { Game } from '../../model/game'
import type { PickBoard } from '../../model/pickBoard'
import { PickControl } from './PickControl'

const AWAY_TEAM = { id: 16, abbreviation: 'MIA', city: 'Miami', name: 'Heat', fullName: 'Miami Heat' }
const HOME_TEAM = { id: 1, abbreviation: 'ATL', city: 'Atlanta', name: 'Hawks', fullName: 'Atlanta Hawks' }
const BEFORE_START = new Date('2026-10-29T22:00:00.000Z')
const AFTER_START = new Date('2026-10-30T00:00:00.000Z')

function buildGame(overrides: Partial<Game>): Game {
    const game: Game = {
        id: 7,
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

function readyBoard(picksByGame: Record<number, number>): PickBoard {
    const board: PickBoard = {
        phase: 'ready',
        picksByGame,
        choose: () => Promise.resolve({ kind: 'saved' }),
    }
    return board
}

function render(game: Game, board: PickBoard, now: Date): string {
    const markup = renderToStaticMarkup(
        <StaticRouter location="/">
            <PickControl game={game} now={now} board={board} />
        </StaticRouter>,
    )
    return markup
}

describe('PickControl', () => {
    it('mostra os dois times como botões de escolha antes do início', () => {
        const markup = render(buildGame({}), readyBoard({}), BEFORE_START)

        expect(markup).toContain('Escolha o vencedor')
        expect(markup).toContain('Heat')
        expect(markup).toContain('Hawks')
        expect(markup.match(/aria-pressed="false"/g)).toHaveLength(2)
    })

    it('marca o time escolhido com aria-pressed e texto', () => {
        const markup = render(buildGame({}), readyBoard({ 7: HOME_TEAM.id }), BEFORE_START)

        expect(markup.match(/aria-pressed="true"/g)).toHaveLength(1)
        expect(markup).toContain('Seu palpite: Hawks')
    })

    it('depois do início mostra o palpite sem botões', () => {
        const markup = render(buildGame({ status: 'live' }), readyBoard({ 7: HOME_TEAM.id }), AFTER_START)

        expect(markup).toContain('Seu palpite: Hawks')
        expect(markup).not.toContain('<button')
    })

    it('no jogo final mostra Acertou ou Errou', () => {
        const final = buildGame({ status: 'final', winnerTeamId: HOME_TEAM.id })

        expect(render(final, readyBoard({ 7: HOME_TEAM.id }), AFTER_START)).toContain('Acertou')
        expect(render(final, readyBoard({ 7: AWAY_TEAM.id }), AFTER_START)).toContain('Errou')
    })

    it('mostra Sem palpite quando o jogo começou sem escolha', () => {
        const markup = render(buildGame({ status: 'live' }), readyBoard({}), AFTER_START)

        expect(markup).toContain('Sem palpite')
    })

    it('convida o visitante a entrar enquanto o palpite está aberto', () => {
        const markup = render(buildGame({}), { phase: 'anonymous' }, BEFORE_START)

        expect(markup).toContain('Entre para dar seu palpite')
        expect(markup).toContain('href="/login"')
    })

    it('não mostra nada ao visitante depois do início', () => {
        expect(render(buildGame({ status: 'live' }), { phase: 'anonymous' }, AFTER_START)).toBe('')
    })

    it('não mostra nada enquanto os palpites carregam', () => {
        expect(render(buildGame({}), { phase: 'loading' }, BEFORE_START)).toBe('')
    })
})
