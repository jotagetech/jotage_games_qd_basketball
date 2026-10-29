import type { FormErrors } from './formErrors'
import { validateUsername } from './username'

export const PASSWORD_MIN_LENGTH = 8

export const EMAIL_MESSAGE = 'Informe um e-mail válido.'
export const PASSWORD_REQUIRED_MESSAGE = 'Informe a senha.'
export const PASSWORD_LENGTH_MESSAGE = `A senha precisa ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface SignInFields {
    email: string
    password: string
}

export interface SignUpFields extends SignInFields {
    username: string
}

function validateEmail(raw: string): string | null {
    const email = raw.trim()
    const message = EMAIL_SHAPE.test(email) ? null : EMAIL_MESSAGE
    return message
}

function validateNewPassword(password: string): string | null {
    const message = password.length >= PASSWORD_MIN_LENGTH ? null : PASSWORD_LENGTH_MESSAGE
    return message
}

export function validateSignIn(fields: SignInFields): FormErrors {
    const errors: FormErrors = {}
    const emailMessage = validateEmail(fields.email)

    if (emailMessage) {
        errors.email = emailMessage
    }

    if (fields.password.length === 0) {
        errors.password = PASSWORD_REQUIRED_MESSAGE
    }

    return errors
}

export function validateSignUp(fields: SignUpFields): FormErrors {
    const errors: FormErrors = {}
    const usernameMessage = validateUsername(fields.username)
    const emailMessage = validateEmail(fields.email)
    const passwordMessage = validateNewPassword(fields.password)

    if (usernameMessage) {
        errors.username = usernameMessage
    }

    if (emailMessage) {
        errors.email = emailMessage
    }

    if (passwordMessage) {
        errors.password = passwordMessage
    }

    return errors
}
