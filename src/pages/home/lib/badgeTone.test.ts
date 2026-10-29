import { describe, expect, it } from 'vitest'

import { TEAM_BRANDS } from '../config/teamBrand'
import { BADGE_DARK_TEXT, BADGE_LIGHT_TEXT, badgeTextColor } from './badgeTone'
import { contrastRatio } from '@/shared/lib/contrast'

const MIN_READABLE_CONTRAST = 3

describe('badgeTextColor', () => {
    it('usa texto claro sobre fundo escuro', () => {
        expect(badgeTextColor('#0C2340')).toBe(BADGE_LIGHT_TEXT)
    })

    it('usa texto escuro sobre fundo claro', () => {
        expect(badgeTextColor('#C4CED4')).toBe(BADGE_DARK_TEXT)
    })

    it('mantém contraste legível para as cores de todos os times', () => {
        for (const [abbreviation, brand] of Object.entries(TEAM_BRANDS)) {
            const text = badgeTextColor(brand.color)
            const ratio = contrastRatio(text, brand.color)

            expect(ratio, abbreviation).toBeGreaterThanOrEqual(MIN_READABLE_CONTRAST)
        }
    })
})
