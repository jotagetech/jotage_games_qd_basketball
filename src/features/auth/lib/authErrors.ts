import type { AuthFailure } from './formErrors'
import { PASSWORD_LENGTH_MESSAGE } from './validateForms'

export interface RawAuthError {
    code?: string
    name?: string
    status?: number
    message?: string
}

export const INVALID_CREDENTIALS_MESSAGE = 'E-mail ou senha incorretos.'
export const EMAIL_TAKEN_MESSAGE = 'Este e-mail já está cadastrado.'
export const USERNAME_TAKEN_MESSAGE = 'Este apelido já está em uso.'
export const NETWORK_MESSAGE = 'Sem conexão. Verifique a internet e tente de novo.'
export const RATE_LIMIT_MESSAGE = 'Muitas tentativas. Aguarde um pouco e tente de novo.'
export const GENERIC_MESSAGE = 'Não foi possível concluir. Tente de novo.'

const NETWORK_ERROR_NAME = 'AuthRetryableFetchError'
const DATABASE_ERROR = /database error|duplicate key|profiles_username/i

const FAILURE_BY_CODE: Record<string, AuthFailure> = {
    invalid_credentials: { field: 'form', message: INVALID_CREDENTIALS_MESSAGE },
    user_already_exists: { field: 'email', message: EMAIL_TAKEN_MESSAGE },
    email_exists: { field: 'email', message: EMAIL_TAKEN_MESSAGE },
    weak_password: { field: 'password', message: PASSWORD_LENGTH_MESSAGE },
    over_request_rate_limit: { field: 'form', message: RATE_LIMIT_MESSAGE },
    over_email_send_rate_limit: { field: 'form', message: RATE_LIMIT_MESSAGE },
}

const NETWORK_FAILURE: AuthFailure = { field: 'form', message: NETWORK_MESSAGE }
export const USERNAME_TAKEN_FAILURE: AuthFailure = {
    field: 'username',
    message: USERNAME_TAKEN_MESSAGE,
}
export const GENERIC_FAILURE: AuthFailure = { field: 'form', message: GENERIC_MESSAGE }

export function translateAuthError(error: RawAuthError): AuthFailure {
    if (error.name === NETWORK_ERROR_NAME || error.status === 0) {
        return NETWORK_FAILURE
    }

    const byCode = error.code ? FAILURE_BY_CODE[error.code] : undefined

    if (byCode) {
        return byCode
    }

    // Gatilho de cadastro recusando o apelido (repetido por corrida ou inválido).
    if (error.message && DATABASE_ERROR.test(error.message)) {
        return USERNAME_TAKEN_FAILURE
    }

    return GENERIC_FAILURE
}
