import { getSupabaseClient } from '@/shared/api'

import type { RankingEntry } from '../model/rankingEntry'

interface RankingRow {
    position: number
    username: string
    wins: number
    losses: number
    win_rate: number
}

// O cliente sem tipos gerados não sabe que a função devolve uma lista;
// cada linha é conferida em tempo de execução antes de virar entrada.
function isRankingRow(value: unknown): value is RankingRow {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const row: Record<string, unknown> = { ...value }
    const valid =
        typeof row.position === 'number' &&
        typeof row.username === 'string' &&
        typeof row.wins === 'number' &&
        typeof row.losses === 'number' &&
        typeof row.win_rate === 'number'
    return valid
}

function toEntry(row: RankingRow): RankingEntry {
    const entry: RankingEntry = {
        position: row.position,
        username: row.username,
        wins: row.wins,
        losses: row.losses,
        winRate: row.win_rate,
    }
    return entry
}

export async function fetchRanking(): Promise<RankingEntry[]> {
    const client = getSupabaseClient()
    const { data, error } = await client.rpc('ranking')

    if (error) {
        throw error
    }

    const result: unknown = data
    const rows = Array.isArray(result) ? result.filter(isRankingRow) : []
    const entries = rows.map(toEntry)
    return entries
}
