import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { Viewer } from '@/entities/viewer'

import type { RankingState } from '../../model/useRanking'
import { RankingTable } from './RankingTable'

const ANONYMOUS: Viewer = { phase: 'anonymous' }

function render(state: RankingState, viewer: Viewer = ANONYMOUS): string {
    const markup = renderToStaticMarkup(
        <RankingTable state={state} viewer={viewer} onRetry={() => undefined} />,
    )
    return markup
}

describe('RankingTable', () => {
    it('mostra o estado de carregamento', () => {
        expect(render({ phase: 'loading' })).toContain('Carregando ranking')
    })

    it('mostra a mensagem de vazio', () => {
        const markup = render({ phase: 'ready', entries: [] })

        expect(markup).toContain('Ainda não há palpites julgados.')
        expect(markup).not.toContain('<table')
    })

    it('mostra erro de requisição com nova tentativa', () => {
        const markup = render({ phase: 'error', reason: 'request' })

        expect(markup).toContain('Não foi possível carregar o ranking.')
        expect(markup).toContain('Tentar de novo')
    })

    it('mostra erro de configuração sem nova tentativa', () => {
        const markup = render({ phase: 'error', reason: 'config' })

        expect(markup).toContain('não está configurada')
        expect(markup).not.toContain('Tentar de novo')
    })

    it('renderiza tabela semântica com acertos, erros e porcentagem', () => {
        const markup = render({
            phase: 'ready',
            entries: [
                { position: 1, username: 'ana', wins: 3, losses: 1, winRate: 0.75 },
                { position: 2, username: 'bia', wins: 1, losses: 1, winRate: 0.5 },
            ],
        })

        expect(markup).toContain('<th scope="col">Acertos</th>')
        expect(markup).toContain('<th scope="row">1</th>')
        expect(markup).toContain('ana')
        expect(markup).toContain('75%')
        expect(markup).toContain('50%')
        expect(markup).not.toContain('(você)')
    })

    it('destaca por texto a linha de quem entrou', () => {
        const viewer: Viewer = {
            phase: 'signed-in',
            userId: 'u1',
            profile: { userId: 'u1', username: 'bia', displayName: null },
        }
        const markup = render(
            {
                phase: 'ready',
                entries: [
                    { position: 1, username: 'ana', wins: 3, losses: 1, winRate: 0.75 },
                    { position: 2, username: 'bia', wins: 1, losses: 1, winRate: 0.5 },
                ],
            },
            viewer,
        )

        expect(markup.match(/\(você\)/g)).toHaveLength(1)
    })
})
