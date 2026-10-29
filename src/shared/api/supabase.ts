import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export class MissingSupabaseConfigError extends Error {
    constructor() {
        super('Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY ausentes.')
        this.name = 'MissingSupabaseConfigError'
    }
}

export interface SupabaseEnv {
    VITE_SUPABASE_URL?: string
    VITE_SUPABASE_ANON_KEY?: string
}

export function createSupabaseClient(env: SupabaseEnv): SupabaseClient {
    const url = env.VITE_SUPABASE_URL?.trim()
    const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim()

    if (!url || !anonKey) {
        throw new MissingSupabaseConfigError()
    }

    const client = createClient(url, anonKey)
    return client
}

let sharedClient: SupabaseClient | undefined

export function getSupabaseClient(): SupabaseClient {
    if (!sharedClient) {
        sharedClient = createSupabaseClient({
            VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
            VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
        })
    }

    return sharedClient
}
