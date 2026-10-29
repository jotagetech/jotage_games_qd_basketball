export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 20

const USERNAME_CHARACTERS = /^[a-z0-9_]+$/

export const USERNAME_LENGTH_MESSAGE = `O apelido precisa ter de ${USERNAME_MIN_LENGTH} a ${USERNAME_MAX_LENGTH} caracteres.`
export const USERNAME_CHARACTERS_MESSAGE = 'Use só letras, números e _ no apelido.'

export function normalizeUsername(raw: string): string {
    const normalized = raw.trim().toLowerCase()
    return normalized
}

export function validateUsername(raw: string): string | null {
    const username = normalizeUsername(raw)

    if (username.length > 0 && !USERNAME_CHARACTERS.test(username)) {
        return USERNAME_CHARACTERS_MESSAGE
    }

    if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
        return USERNAME_LENGTH_MESSAGE
    }

    return null
}
