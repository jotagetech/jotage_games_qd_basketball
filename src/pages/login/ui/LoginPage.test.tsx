import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { ViewerProvider } from '@/entities/viewer'

import { LoginPage } from './LoginPage'

function render(): string {
    const markup = renderToStaticMarkup(
        <StaticRouter location="/login">
            <ViewerProvider>
                <LoginPage />
            </ViewerProvider>
        </StaticRouter>,
    )
    return markup
}

describe('LoginPage', () => {
    it('mostra as abas Entrar e Criar conta', () => {
        const markup = render()

        expect(markup).toContain('role="tablist"')
        expect(markup).toContain('>Entrar<')
        expect(markup).toContain('>Criar conta<')
    })

    it('abre no formulário de entrar, com autocomplete correto', () => {
        const markup = render()

        expect(markup).toMatch(/autocomplete="email"/i)
        expect(markup).toMatch(/autocomplete="current-password"/i)
        expect(markup).not.toContain('Apelido')
    })
})
