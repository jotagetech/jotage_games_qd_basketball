import type { Game } from '../model/game'

export type PickSituation = 'open' | 'locked' | 'won' | 'lost' | 'none'

export function isPickOpen(game: Game, now: Date): boolean {
    const startsAt = new Date(game.startsAt).getTime()
    const open = game.status === 'scheduled' && now.getTime() < startsAt
    return open
}

export function pickSituation(game: Game, pickedTeamId: number | null, now: Date): PickSituation {
    if (isPickOpen(game, now)) {
        return 'open'
    }

    if (pickedTeamId === null) {
        return 'none'
    }

    if (game.status !== 'final' || game.winnerTeamId === null) {
        return 'locked'
    }

    const situation = game.winnerTeamId === pickedTeamId ? 'won' : 'lost'
    return situation
}
