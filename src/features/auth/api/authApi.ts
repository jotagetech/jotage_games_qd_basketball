import { getSupabaseClient } from '@/shared/api'

import { GENERIC_FAILURE, USERNAME_TAKEN_FAILURE, translateAuthError } from '../lib/authErrors'
import type { AuthFailure } from '../lib/formErrors'
import { normalizeUsername } from '../lib/username'
import type { SignInFields, SignUpFields } from '../lib/validateForms'

async function attempt(action: () => Promise<AuthFailure | null>): Promise<AuthFailure | null> {
    try {
        const failure = await action()
        return failure
    } catch {
        return GENERIC_FAILURE
    }
}

async function checkUsername(username: string): Promise<AuthFailure | null> {
    const { data, error, status } = await getSupabaseClient().rpc('username_available', {
        candidate: username,
    })

    if (error) {
        // Sem rede o PostgREST devolve status 0, que a tradução reconhece como falha de conexão.
        return translateAuthError({ code: error.code, message: error.message, status })
    }

    const failure = data === true ? null : USERNAME_TAKEN_FAILURE
    return failure
}

export function signIn(fields: SignInFields): Promise<AuthFailure | null> {
    const result = attempt(async () => {
        const { error } = await getSupabaseClient().auth.signInWithPassword({
            email: fields.email.trim(),
            password: fields.password,
        })
        const failure = error ? translateAuthError(error) : null
        return failure
    })
    return result
}

export function signUp(fields: SignUpFields): Promise<AuthFailure | null> {
    const result = attempt(async () => {
        const username = normalizeUsername(fields.username)

        const usernameFailure = await checkUsername(username)
        if (usernameFailure) {
            return usernameFailure
        }

        const { error } = await getSupabaseClient().auth.signUp({
            email: fields.email.trim(),
            password: fields.password,
            options: { data: { username } },
        })
        const failure = error ? translateAuthError(error) : null
        return failure
    })
    return result
}

export async function signOut(): Promise<void> {
    await getSupabaseClient().auth.signOut()
}
