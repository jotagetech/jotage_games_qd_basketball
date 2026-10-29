import { describe, expect, it } from 'vitest'

import { MissingSupabaseConfigError, createSupabaseClient } from './supabase'

describe('createSupabaseClient', () => {
    it('lança erro tipado quando as variáveis faltam', () => {
        expect(() => createSupabaseClient({})).toThrow(MissingSupabaseConfigError)
    })

    it('lança erro tipado quando as variáveis estão em branco', () => {
        const env = { VITE_SUPABASE_URL: '  ', VITE_SUPABASE_ANON_KEY: '' }

        expect(() => createSupabaseClient(env)).toThrow(MissingSupabaseConfigError)
    })

    it('cria o cliente quando as variáveis existem', () => {
        const env = {
            VITE_SUPABASE_URL: 'https://example.supabase.co',
            VITE_SUPABASE_ANON_KEY: 'chave-publica-de-teste',
        }

        expect(createSupabaseClient(env)).toBeDefined()
    })
})
