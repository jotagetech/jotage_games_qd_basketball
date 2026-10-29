import { describe, expect, it } from 'vitest'
import { buildGameWindow } from './window.ts'

describe('buildGameWindow', () => {
    it('vai de ontem a 7 dias à frente na data ET', () => {
        const window = buildGameWindow(new Date('2026-10-29T15:00:00Z'))

        expect(window).toEqual({
            startDate: '2026-10-28',
            endDate: '2026-11-05',
        })
    })

    it('antes da virada do dia em ET ainda conta o dia anterior', () => {
        const window = buildGameWindow(new Date('2026-10-30T02:00:00Z'))

        expect(window.startDate).toBe('2026-10-28')
        expect(window.endDate).toBe('2026-11-05')
    })

    it('depois da virada do dia em ET avança a janela', () => {
        const window = buildGameWindow(new Date('2026-10-30T05:00:00Z'))

        expect(window.startDate).toBe('2026-10-29')
        expect(window.endDate).toBe('2026-11-06')
    })

    it('atravessa a virada de mês', () => {
        const window = buildGameWindow(new Date('2026-10-31T16:00:00Z'))

        expect(window.startDate).toBe('2026-10-30')
        expect(window.endDate).toBe('2026-11-07')
    })
})
