import { describe, expect, it } from 'vitest'

import {
    EMAIL_TAKEN_MESSAGE,
    GENERIC_MESSAGE,
    INVALID_CREDENTIALS_MESSAGE,
    NETWORK_MESSAGE,
    RATE_LIMIT_MESSAGE,
    USERNAME_TAKEN_MESSAGE,
    translateAuthError,
} from './authErrors'
import { PASSWORD_LENGTH_MESSAGE } from './validateForms'

describe('translateAuthError', () => {
    it('traduz credenciais incorretas', () => {
        expect(translateAuthError({ code: 'invalid_credentials' })).toEqual({
            field: 'form',
            message: INVALID_CREDENTIALS_MESSAGE,
        })
    })

    it('traduz e-mail já cadastrado no campo de e-mail', () => {
        expect(translateAuthError({ code: 'user_already_exists' })).toEqual({
            field: 'email',
            message: EMAIL_TAKEN_MESSAGE,
        })
        expect(translateAuthError({ code: 'email_exists' }).field).toBe('email')
    })

    it('traduz senha fraca no campo de senha', () => {
        expect(translateAuthError({ code: 'weak_password' })).toEqual({
            field: 'password',
            message: PASSWORD_LENGTH_MESSAGE,
        })
    })

    it('traduz falha de rede', () => {
        const expected = { field: 'form', message: NETWORK_MESSAGE }

        expect(translateAuthError({ name: 'AuthRetryableFetchError', status: 0 })).toEqual(expected)
        expect(translateAuthError({ status: 0 })).toEqual(expected)
        expect(
            translateAuthError({ code: '', message: 'TypeError: Failed to fetch', status: 0 }),
        ).toEqual(expected)
    })

    it('traduz limite de tentativas', () => {
        expect(translateAuthError({ code: 'over_request_rate_limit' })).toEqual({
            field: 'form',
            message: RATE_LIMIT_MESSAGE,
        })
    })

    it('trata recusa do gatilho de cadastro como apelido em uso', () => {
        expect(
            translateAuthError({
                code: 'unexpected_failure',
                message: 'Database error saving new user',
            }),
        ).toEqual({ field: 'username', message: USERNAME_TAKEN_MESSAGE })
    })

    it('trata violação de unicidade do apelido como apelido em uso', () => {
        expect(
            translateAuthError({
                code: '23505',
                message: 'duplicate key value violates unique constraint "profiles_username_key"',
            }),
        ).toEqual({ field: 'username', message: USERNAME_TAKEN_MESSAGE })
    })

    it('cai numa mensagem genérica para erro desconhecido', () => {
        expect(translateAuthError({ code: 'algo_novo', message: 'x' })).toEqual({
            field: 'form',
            message: GENERIC_MESSAGE,
        })
    })
})
