import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import type { Viewer } from '@/entities/viewer'

import { ViewerMenu } from './ViewerMenu'

function render(viewer: Viewer): string {
    const markup = renderToStaticMarkup(
        <StaticRouter location="/">
            <ViewerMenu viewer={viewer} />
        </StaticRouter>,
    )
    return markup
}

describe('ViewerMenu', () => {
    it('não mostra nada enquanto a sessão carrega', () => {
        expect(render({ phase: 'loading' })).toBe('')
    })

    it('oferece Entrar ao visitante', () => {
        const markup = render({ phase: 'anonymous' })

        expect(markup).toContain('href="/login"')
        expect(markup).toContain('>Entrar<')
        expect(markup).not.toContain('>Sair<')
    })

    it('mostra o apelido e Sair a quem entrou', () => {
        const markup = render({
            phase: 'signed-in',
            userId: 'u1',
            profile: { userId: 'u1', username: 'ana_01', displayName: null },
        })

        expect(markup).toContain('ana_01')
        expect(markup).toContain('>Sair<')
        expect(markup).not.toContain('>Entrar<')
    })

    it('usa o texto de reserva enquanto o perfil não chegou', () => {
        const markup = render({ phase: 'signed-in', userId: 'u1', profile: null })

        expect(markup).toContain('Minha conta')
        expect(markup).toContain('>Sair<')
    })
})
