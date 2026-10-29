import { isIsoDate } from '@/shared/lib/date'

const DATE_PARAM = 'data'

export function readDateParam(search: string, fallback: string): string {
    const requested = new URLSearchParams(search).get(DATE_PARAM)
    const date = requested !== null && isIsoDate(requested) ? requested : fallback
    return date
}

export function buildDateSearch(isoDate: string): string {
    const params = new URLSearchParams({ [DATE_PARAM]: isoDate })
    const search = `?${params.toString()}`
    return search
}
