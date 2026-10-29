import { describe, expect, it } from 'vitest'

import { PICK_CLOSED_MESSAGE, translatePickError } from './pickError'

describe('translatePickError', () => {
    it('traduz a trava de início e marca o palpite como encerrado', () => {
        const failure = translatePickError({ code: 'QD001', message: 'palpite encerrado' })

        expect(failure).toEqual({ message: PICK_CLOSED_MESSAGE, closed: true })
    })

    it('traduz o time fora do jogo sem marcar como encerrado', () => {
        const failure = translatePickError({ code: 'QD002', message: 'time fora do jogo' })

        expect(failure.message).toBe('Esse time não joga nesta partida.')
        expect(failure.closed).toBe(false)
    })

    it('usa a mensagem genérica para qualquer outro erro', () => {
        expect(translatePickError({ code: '42501' }).closed).toBe(false)
        expect(translatePickError(new Error('rede')).message).toContain('Não foi possível salvar')
        expect(translatePickError(null).message).toContain('Não foi possível salvar')
    })
})
