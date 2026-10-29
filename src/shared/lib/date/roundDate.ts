const ROUND_TIME_ZONE = 'America/New_York'
const DISPLAY_TIME_ZONE = 'America/Sao_Paulo'
const ROUND_CUTOFF_HOURS = 6
const MS_PER_HOUR = 3_600_000
const MS_PER_DAY = 86_400_000
const NOON_HOUR_UTC = 12
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

const roundDateFormat = new Intl.DateTimeFormat('en-CA', {
    timeZone: ROUND_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
})

const dateLabelFormat = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
})

const timeFormat = new Intl.DateTimeFormat('pt-BR', {
    timeZone: DISPLAY_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
})

function isoDateToNoonUtc(isoDate: string): Date {
    const match = ISO_DATE_PATTERN.exec(isoDate)
    if (!match) {
        throw new Error(`Data inválida: ${isoDate}`)
    }

    const [, year, month, day] = match
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), NOON_HOUR_UTC))
}

export function isIsoDate(value: string): boolean {
    const match = ISO_DATE_PATTERN.exec(value)
    if (!match) {
        return false
    }

    const roundTrip = addDays(value, 0)
    return roundTrip === value
}

export function defaultRoundDate(now: Date): string {
    const shifted = new Date(now.getTime() - ROUND_CUTOFF_HOURS * MS_PER_HOUR)
    const formatted = roundDateFormat.format(shifted)
    return formatted
}

export function addDays(isoDate: string, days: number): string {
    const base = isoDateToNoonUtc(isoDate)
    const moved = new Date(base.getTime() + days * MS_PER_DAY)
    const formatted = moved.toISOString().slice(0, 10)
    return formatted
}

export function formatDateLabel(isoDate: string): string {
    const noon = isoDateToNoonUtc(isoDate)
    const label = dateLabelFormat.format(noon)
    return label
}

export function formatTimeInSaoPaulo(startsAt: string): string {
    const formatted = timeFormat.format(new Date(startsAt))
    return formatted
}
