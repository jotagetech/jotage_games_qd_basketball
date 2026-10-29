import { describe, expect, it } from 'vitest'

import { buildDateSearch, readDateParam } from './dateParam'

const FALLBACK = '2026-10-29'

describe('readDateParam', () => {
    it('lê a data válida da URL', () => {
        expect(readDateParam('?data=2026-10-20', FALLBACK)).toBe('2026-10-20')
    })

    it('usa a data padrão sem parâmetro', () => {
        expect(readDateParam('', FALLBACK)).toBe(FALLBACK)
    })

    it('usa a data padrão quando o valor é inválido', () => {
        expect(readDateParam('?data=ontem', FALLBACK)).toBe(FALLBACK)
        expect(readDateParam('?data=2026-02-31', FALLBACK)).toBe(FALLBACK)
    })
})

describe('buildDateSearch', () => {
    it('monta a query da data', () => {
        expect(buildDateSearch('2026-10-20')).toBe('?data=2026-10-20')
    })
})
