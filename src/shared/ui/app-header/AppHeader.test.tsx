import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { AppHeader } from './AppHeader'

function render(location: string): string {
    const markup = renderToStaticMarkup(
        <StaticRouter location={location}>
            <AppHeader>
                <span>ação do header</span>
            </AppHeader>
        </StaticRouter>,
    )
    return markup
}

describe('AppHeader', () => {
    it('mostra o título, o logo e os links de navegação', () => {
        const markup = render('/')

        expect(markup).toContain('<h1')
        expect(markup).toContain('QD Basketball')
        expect(markup).toContain('alt="Quádruplo Duplo"')
        expect(markup).toContain('href="/ranking"')
        expect(markup).toContain('>Ranking<')
        expect(markup).toContain('>Jogos<')
    })

    it('marca a página atual na navegação', () => {
        const markup = render('/ranking')

        expect(markup).toMatch(/aria-current="page"[^>]*href="\/ranking"|href="\/ranking"[^>]*aria-current="page"/)
        expect(markup).not.toMatch(/href="\/"[^>]*aria-current="page"/)
    })

    it('renderiza o conteúdo recebido', () => {
        const markup = render('/')

        expect(markup).toContain('ação do header')
    })
})
