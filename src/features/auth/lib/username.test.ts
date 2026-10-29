import { describe, expect, it } from 'vitest'

import {
    USERNAME_CHARACTERS_MESSAGE,
    USERNAME_LENGTH_MESSAGE,
    normalizeUsername,
    validateUsername,
} from './username'

describe('normalizeUsername', () => {
    it('remove espaços nas pontas e põe em minúsculas', () => {
        expect(normalizeUsername('  Ana_Silva ')).toBe('ana_silva')
    })
})

describe('validateUsername', () => {
    it('aceita apelido válido, com maiúsculas normalizadas', () => {
        expect(validateUsername('Ana_01')).toBeNull()
    })

    it('aceita os limites de tamanho', () => {
        expect(validateUsername('abc')).toBeNull()
        expect(validateUsername('a'.repeat(20))).toBeNull()
    })

    it('recusa apelido curto ou vazio', () => {
        expect(validateUsername('ab')).toBe(USERNAME_LENGTH_MESSAGE)
        expect(validateUsername('   ')).toBe(USERNAME_LENGTH_MESSAGE)
    })

    it('recusa apelido longo', () => {
        expect(validateUsername('a'.repeat(21))).toBe(USERNAME_LENGTH_MESSAGE)
    })

    it('recusa caracteres fora de letras, números e _', () => {
        expect(validateUsername('ana-silva')).toBe(USERNAME_CHARACTERS_MESSAGE)
        expect(validateUsername('ana silva')).toBe(USERNAME_CHARACTERS_MESSAGE)
        expect(validateUsername('ação')).toBe(USERNAME_CHARACTERS_MESSAGE)
    })
})
