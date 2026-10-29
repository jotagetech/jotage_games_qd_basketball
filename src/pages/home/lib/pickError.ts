const PICK_CLOSED_CODE = 'QD001'
const PICK_TEAM_MISMATCH_CODE = 'QD002'

export const PICK_CLOSED_MESSAGE = 'Palpites encerrados: o jogo já começou.'
const PICK_TEAM_MISMATCH_MESSAGE = 'Esse time não joga nesta partida.'
const PICK_FAILED_MESSAGE = 'Não foi possível salvar o palpite. Tente de novo.'

export interface PickFailure {
    message: string
    closed: boolean
}

function errorCode(error: unknown): string | null {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
        return null
    }

    const code = typeof error.code === 'string' ? error.code : null
    return code
}

export function translatePickError(error: unknown): PickFailure {
    const code = errorCode(error)

    if (code === PICK_CLOSED_CODE) {
        return { message: PICK_CLOSED_MESSAGE, closed: true }
    }

    if (code === PICK_TEAM_MISMATCH_CODE) {
        return { message: PICK_TEAM_MISMATCH_MESSAGE, closed: false }
    }

    return { message: PICK_FAILED_MESSAGE, closed: false }
}
