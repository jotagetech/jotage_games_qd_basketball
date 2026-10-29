import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { ViewerProvider } from '@/entities/viewer'

import { RankingPage } from './RankingPage'

function render(): string {
    const markup = renderToStaticMarkup(
        <StaticRouter location="/ranking">
            <ViewerProvider>
                <RankingPage />
            </ViewerProvider>
        </StaticRouter>,
    )
    return markup
}

describe('RankingPage', () => {
    it('mostra o topo com o link de Ranking', () => {
        const markup = render()

        expect(markup).toContain('QD Basketball')
        expect(markup).toContain('href="/ranking"')
        expect(markup).toContain('>Ranking<')
    })

    it('começa no estado de carregamento', () => {
        expect(render()).toContain('Carregando ranking')
    })
})
