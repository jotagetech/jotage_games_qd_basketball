import { describe, expect, it } from 'vitest'

import {
    EMAIL_MESSAGE,
    PASSWORD_LENGTH_MESSAGE,
    PASSWORD_REQUIRED_MESSAGE,
    validateSignIn,
    validateSignUp,
} from './validateForms'
import { USERNAME_LENGTH_MESSAGE } from './username'

describe('validateSignIn', () => {
    it('aceita e-mail e senha preenchidos', () => {
        expect(validateSignIn({ email: 'ana@exemplo.com', password: 'x' })).toEqual({})
    })

    it('recusa e-mail malformado e senha vazia', () => {
        expect(validateSignIn({ email: 'ana', password: '' })).toEqual({
            email: EMAIL_MESSAGE,
            password: PASSWORD_REQUIRED_MESSAGE,
        })
    })
})

describe('validateSignUp', () => {
    const valid = { username: 'ana_01', email: 'ana@exemplo.com', password: '12345678' }

    it('aceita dados válidos', () => {
        expect(validateSignUp(valid)).toEqual({})
    })

    it('recusa senha com menos de 8 caracteres', () => {
        expect(validateSignUp({ ...valid, password: '1234567' })).toEqual({
            password: PASSWORD_LENGTH_MESSAGE,
        })
    })

    it('recusa apelido inválido e e-mail malformado juntos', () => {
        expect(validateSignUp({ ...valid, username: 'a', email: 'x@y' })).toEqual({
            username: USERNAME_LENGTH_MESSAGE,
            email: EMAIL_MESSAGE,
        })
    })
})
