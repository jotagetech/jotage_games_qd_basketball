import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { ViewerProvider } from '@/entities/viewer'

import { HomePage } from './HomePage'

function render(): string {
    const markup = renderToStaticMarkup(
        <StaticRouter location="/">
            <ViewerProvider>
                <HomePage />
            </ViewerProvider>
        </StaticRouter>,
    )
    return markup
}

describe('HomePage', () => {
    it('renderiza o título do produto', () => {
        const markup = render()

        expect(markup).toContain('<h1')
        expect(markup).toContain('QD Basketball')
    })

    it('renderiza a navegação de data e o estado de carregamento', () => {
        const markup = render()

        expect(markup).toContain('aria-label="Dia anterior"')
        expect(markup).toContain('aria-label="Próximo dia"')
        expect(markup).toContain('>Hoje<')
        expect(markup).toContain('Carregando jogos')
    })

    it('renderiza o logo do parceiro com texto alternativo', () => {
        const markup = render()

        expect(markup).toContain('src="/brand/quadruplo-duplo.png"')
        expect(markup).toContain('alt="Quádruplo Duplo"')
    })
})
