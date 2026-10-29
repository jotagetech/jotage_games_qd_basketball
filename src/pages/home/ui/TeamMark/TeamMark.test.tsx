import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { TeamMark } from './TeamMark'

describe('TeamMark', () => {
    it('mostra o logo do time com o nome como texto alternativo', () => {
        const markup = renderToStaticMarkup(<TeamMark abbreviation="BOS" teamName="Boston Celtics" />)

        expect(markup).toContain('https://a.espncdn.com/i/teamlogos/nba/500-dark/bos.png')
        expect(markup).toContain('alt="Boston Celtics"')
    })

    it('cai no selo com a abreviação quando o time não está no mapa', () => {
        const markup = renderToStaticMarkup(<TeamMark abbreviation="XYZ" teamName="Time Novo" />)

        expect(markup).not.toContain('<img')
        expect(markup).toContain('>XYZ<')
        expect(markup).toContain('aria-label="Time Novo"')
    })
})
