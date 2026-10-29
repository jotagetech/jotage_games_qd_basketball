import { describe, expect, it } from 'vitest'

import type { Viewer } from '@/entities/viewer'

import type { RankingEntry } from '../model/rankingEntry'
import { formatWinRate, isViewerEntry } from './rankingFormat'

const ENTRY: RankingEntry = { position: 1, username: 'ana', wins: 3, losses: 1, winRate: 0.75 }

function signedIn(username: string | null): Viewer {
    const profile = username ? { userId: 'u1', username, displayName: null } : null
    const viewer: Viewer = { phase: 'signed-in', userId: 'u1', profile }
    return viewer
}

describe('formatWinRate', () => {
    it('converte a taxa em porcentagem inteira', () => {
        expect(formatWinRate(0.75)).toBe('75%')
        expect(formatWinRate(2 / 3)).toBe('67%')
    })

    it('mostra 0% e 100% nas pontas', () => {
        expect(formatWinRate(0)).toBe('0%')
        expect(formatWinRate(1)).toBe('100%')
    })
})

describe('isViewerEntry', () => {
    it('reconhece a linha de quem entrou pelo apelido', () => {
        expect(isViewerEntry(ENTRY, signedIn('ana'))).toBe(true)
    })

    it('não marca a linha de outra pessoa', () => {
        expect(isViewerEntry(ENTRY, signedIn('bia'))).toBe(false)
    })

    it('não marca nada sem perfil, visitante ou sessão carregando', () => {
        expect(isViewerEntry(ENTRY, signedIn(null))).toBe(false)
        expect(isViewerEntry(ENTRY, { phase: 'anonymous' })).toBe(false)
        expect(isViewerEntry(ENTRY, { phase: 'loading' })).toBe(false)
    })
})
