import { describe, expect, it } from 'vitest'

import { TEAM_BRANDS, findTeamBrand, teamLogoUrl } from './teamBrand'

const NBA_TEAM_COUNT = 30

describe('TEAM_BRANDS', () => {
    it('cobre os 30 times', () => {
        expect(Object.keys(TEAM_BRANDS)).toHaveLength(NBA_TEAM_COUNT)
    })

    it('não repete id da NBA', () => {
        const ids = Object.values(TEAM_BRANDS).map((brand) => brand.logoSlug)

        expect(new Set(ids).size).toBe(NBA_TEAM_COUNT)
    })

    it('usa cor hexadecimal de seis dígitos', () => {
        for (const brand of Object.values(TEAM_BRANDS)) {
            expect(brand.color).toMatch(/^#[0-9A-F]{6}$/i)
        }
    })
})

describe('findTeamBrand', () => {
    it('ignora caixa e espaços da abreviação', () => {
        expect(findTeamBrand(' lal ')).toBe(TEAM_BRANDS.LAL)
    })

    it('devolve indefinido para abreviação fora do mapa', () => {
        expect(findTeamBrand('XYZ')).toBeUndefined()
        expect(findTeamBrand('constructor')).toBeUndefined()
    })
})

describe('teamLogoUrl', () => {
    it('monta o endereço do logo pelo identificador da ESPN', () => {
        const url = teamLogoUrl(TEAM_BRANDS.BOS)

        expect(url).toBe('https://a.espncdn.com/i/teamlogos/nba/500-dark/bos.png')
    })
})
