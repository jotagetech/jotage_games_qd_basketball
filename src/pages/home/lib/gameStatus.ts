import { formatTimeInSaoPaulo } from '@/shared/lib/date'

import type { Game, GameStatus } from '../model/game'

const REGULATION_PERIODS = 4
const CLOCK_PATTERN = /^\d{1,2}:\d{2}(\.\d+)?$/
const HALFTIME_CLOCK_PATTERN = /^(half|halftime|intermiss)/i

const STATIC_STATUS_LABELS: Record<'postponed' | 'canceled' | 'unavailable', string> = {
    postponed: 'Adiado',
    canceled: 'Cancelado',
    unavailable: 'Indisponível',
}

export function hasScoreboard(status: GameStatus): boolean {
    const result = status === 'live' || status === 'final'
    return result
}

export function periodLabel(period: number): string {
    if (period <= REGULATION_PERIODS) {
        return `${period}º quarto`
    }

    const overtime = period - REGULATION_PERIODS
    const label = overtime === 1 ? 'Prorrogação' : `${overtime}ª prorrogação`
    return label
}

function liveLabel(game: Game): string {
    const clock = game.clock?.trim() ?? ''

    if (HALFTIME_CLOCK_PATTERN.test(clock)) {
        return 'Intervalo'
    }

    if (game.period === null) {
        return 'Ao vivo'
    }

    const period = periodLabel(game.period)
    if (!CLOCK_PATTERN.test(clock)) {
        return period
    }

    const label = `${period}, ${clock}`
    return label
}

function finalLabel(game: Game): string {
    const wentToOvertime = game.period !== null && game.period > REGULATION_PERIODS
    const label = wentToOvertime ? 'Final na prorrogação' : 'Final'
    return label
}

export function statusLabel(game: Game): string {
    switch (game.status) {
        case 'scheduled':
            return formatTimeInSaoPaulo(game.startsAt)
        case 'live':
            return liveLabel(game)
        case 'final':
            return finalLabel(game)
        default:
            return STATIC_STATUS_LABELS[game.status]
    }
}
