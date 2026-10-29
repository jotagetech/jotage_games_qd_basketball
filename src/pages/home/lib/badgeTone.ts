import { contrastRatio } from '@/shared/lib/contrast'

export const BADGE_LIGHT_TEXT = '#f6efe9'
export const BADGE_DARK_TEXT = '#1c1412'

export function badgeTextColor(background: string): string {
    const lightContrast = contrastRatio(BADGE_LIGHT_TEXT, background)
    const darkContrast = contrastRatio(BADGE_DARK_TEXT, background)
    const color = lightContrast >= darkContrast ? BADGE_LIGHT_TEXT : BADGE_DARK_TEXT
    return color
}
