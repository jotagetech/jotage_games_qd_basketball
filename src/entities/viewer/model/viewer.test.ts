import { describe, expect, it } from 'vitest'

import type { Profile } from './profile'
import { deriveViewer } from './viewer'

const profile: Profile = { userId: 'u1', username: 'ana', displayName: null }

describe('deriveViewer', () => {
    it('fica em carregamento enquanto a sessão não foi resolvida', () => {
        expect(deriveViewer(undefined, null)).toEqual({ phase: 'loading' })
    })

    it('é visitante quando não há sessão', () => {
        expect(deriveViewer(null, profile)).toEqual({ phase: 'anonymous' })
    })

    it('devolve o perfil do usuário da sessão', () => {
        expect(deriveViewer('u1', profile)).toEqual({
            phase: 'signed-in',
            userId: 'u1',
            profile,
        })
    })

    it('ignora o perfil de outro usuário', () => {
        expect(deriveViewer('u2', profile)).toEqual({
            phase: 'signed-in',
            userId: 'u2',
            profile: null,
        })
    })
})
