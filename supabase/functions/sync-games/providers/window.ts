import type { GameWindow } from './types.ts'

const NBA_TIME_ZONE = 'America/New_York'
const DAYS_BEHIND = 1
const DAYS_AHEAD = 7
const MILLISECONDS_PER_DAY = 86_400_000

const nbaDateFormat = new Intl.DateTimeFormat('en-CA', {
    timeZone: NBA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
})

function shiftDays(isoDate: string, days: number): string {
    const baseTime = Date.parse(`${isoDate}T00:00:00Z`)
    const shifted = new Date(baseTime + days * MILLISECONDS_PER_DAY)
    const shiftedDate = shifted.toISOString().slice(0, 10)
    return shiftedDate
}

export function buildGameWindow(now: Date): GameWindow {
    const today = nbaDateFormat.format(now)
    const window = {
        startDate: shiftDays(today, -DAYS_BEHIND),
        endDate: shiftDays(today, DAYS_AHEAD),
    }
    return window
}
