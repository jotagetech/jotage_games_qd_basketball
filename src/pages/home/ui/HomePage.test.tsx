import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { HomePage } from './HomePage'

describe('HomePage', () => {
    it('renderiza o título do produto', () => {
        const markup = renderToStaticMarkup(<HomePage />)

        expect(markup).toContain('<h1')
        expect(markup).toContain('QD Basketball')
    })

    it('renderiza a navegação de data e o estado de carregamento', () => {
        const markup = renderToStaticMarkup(<HomePage />)

        expect(markup).toContain('aria-label="Dia anterior"')
        expect(markup).toContain('aria-label="Próximo dia"')
        expect(markup).toContain('>Hoje<')
        expect(markup).toContain('Carregando jogos')
    })

    it('renderiza o logo do parceiro com texto alternativo', () => {
        const markup = renderToStaticMarkup(<HomePage />)

        expect(markup).toContain('src="/brand/quadruplo-duplo.png"')
        expect(markup).toContain('alt="Quádruplo Duplo"')
    })
})
