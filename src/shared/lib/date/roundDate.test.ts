import { describe, expect, it } from 'vitest'

import {
    addDays,
    defaultRoundDate,
    formatDateLabel,
    formatTimeInSaoPaulo,
    isIsoDate,
} from './roundDate'

describe('defaultRoundDate', () => {
    it('mostra a rodada da noite anterior de madrugada no Brasil', () => {
        const earlyMorningInBrazil = new Date('2026-10-29T07:00:00Z')

        expect(defaultRoundDate(earlyMorningInBrazil)).toBe('2026-10-28')
    })

    it('vira para o dia seguinte depois do corte das 6 horas em Nova York', () => {
        const afterCutoff = new Date('2026-10-29T10:30:00Z')

        expect(defaultRoundDate(afterCutoff)).toBe('2026-10-29')
    })

    it('respeita o horário de verão de Nova York', () => {
        const winterEarly = new Date('2026-12-15T10:59:00Z')
        const winterAfter = new Date('2026-12-15T11:01:00Z')

        expect(defaultRoundDate(winterEarly)).toBe('2026-12-14')
        expect(defaultRoundDate(winterAfter)).toBe('2026-12-15')
    })
})

describe('addDays', () => {
    it('soma e subtrai dias', () => {
        expect(addDays('2026-10-29', 1)).toBe('2026-10-30')
        expect(addDays('2026-10-29', -1)).toBe('2026-10-28')
    })

    it('atravessa virada de mês e de ano', () => {
        expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
        expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
        expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    })

    it('atravessa o fim de fevereiro em ano bissexto', () => {
        expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
        expect(addDays('2028-02-29', 1)).toBe('2028-03-01')
    })

    it('rejeita data fora do formato', () => {
        expect(() => addDays('29/10/2026', 1)).toThrow()
    })
})

describe('isIsoDate', () => {
    it('aceita datas reais', () => {
        expect(isIsoDate('2026-10-29')).toBe(true)
    })

    it('recusa formato errado e dia inexistente', () => {
        expect(isIsoDate('2026-1-29')).toBe(false)
        expect(isIsoDate('2026-02-30')).toBe(false)
        expect(isIsoDate('')).toBe(false)
    })
})

describe('formatDateLabel', () => {
    it('escreve dia da semana, dia e mês abreviados em pt-BR', () => {
        expect(formatDateLabel('2026-10-29')).toBe('qui., 29 de out.')
    })
})

describe('formatTimeInSaoPaulo', () => {
    it('converte o instante para o horário de Brasília', () => {
        expect(formatTimeInSaoPaulo('2026-10-30T00:30:00Z')).toBe('21:30')
    })

    it('mostra meia-noite como 00:00', () => {
        expect(formatTimeInSaoPaulo('2026-10-30T03:00:00Z')).toBe('00:00')
    })
})
