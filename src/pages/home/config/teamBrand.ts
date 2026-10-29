export interface TeamBrand {
    logoSlug: string
    color: string
}

export const TEAM_BRANDS: Readonly<Record<string, TeamBrand>> = {
    ATL: { logoSlug: 'atl', color: '#E03A3E' },
    BOS: { logoSlug: 'bos', color: '#007A33' },
    BKN: { logoSlug: 'bkn', color: '#000000' },
    CHA: { logoSlug: 'cha', color: '#1D1160' },
    CHI: { logoSlug: 'chi', color: '#CE1141' },
    CLE: { logoSlug: 'cle', color: '#860038' },
    DAL: { logoSlug: 'dal', color: '#00538C' },
    DEN: { logoSlug: 'den', color: '#0E2240' },
    DET: { logoSlug: 'det', color: '#C8102E' },
    GSW: { logoSlug: 'gs', color: '#1D428A' },
    HOU: { logoSlug: 'hou', color: '#CE1141' },
    IND: { logoSlug: 'ind', color: '#002D62' },
    LAC: { logoSlug: 'lac', color: '#C8102E' },
    LAL: { logoSlug: 'lal', color: '#552583' },
    MEM: { logoSlug: 'mem', color: '#5D76A9' },
    MIA: { logoSlug: 'mia', color: '#98002E' },
    MIL: { logoSlug: 'mil', color: '#00471B' },
    MIN: { logoSlug: 'min', color: '#0C2340' },
    NOP: { logoSlug: 'no', color: '#0C2340' },
    NYK: { logoSlug: 'ny', color: '#006BB6' },
    OKC: { logoSlug: 'okc', color: '#007AC1' },
    ORL: { logoSlug: 'orl', color: '#0077C0' },
    PHI: { logoSlug: 'phi', color: '#006BB6' },
    PHX: { logoSlug: 'phx', color: '#1D1160' },
    POR: { logoSlug: 'por', color: '#E03A3E' },
    SAC: { logoSlug: 'sac', color: '#5A2D81' },
    SAS: { logoSlug: 'sa', color: '#C4CED4' },
    TOR: { logoSlug: 'tor', color: '#CE1141' },
    UTA: { logoSlug: 'utah', color: '#002B5C' },
    WAS: { logoSlug: 'wsh', color: '#002B5C' },
}

// PNG de 500 px na variante desenhada para fundo escuro.
const LOGO_BASE_URL = 'https://a.espncdn.com/i/teamlogos/nba/500-dark'

export function findTeamBrand(abbreviation: string): TeamBrand | undefined {
    const key = abbreviation.trim().toUpperCase()
    const brand = Object.hasOwn(TEAM_BRANDS, key) ? TEAM_BRANDS[key] : undefined
    return brand
}

export function teamLogoUrl(brand: TeamBrand): string {
    const url = `${LOGO_BASE_URL}/${brand.logoSlug}.png`
    return url
}
