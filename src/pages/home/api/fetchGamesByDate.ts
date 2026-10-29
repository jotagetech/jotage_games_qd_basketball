import { getSupabaseClient } from '@/shared/api'

import type { Game, GameStatus } from '../model/game'
import type { Team } from '../model/team'

interface TeamRow {
    id: number
    abbreviation: string
    city: string | null
    name: string
    full_name: string
}

interface GameRow {
    id: number
    starts_at: string
    status: GameStatus
    period: number | null
    clock: string | null
    home_score: number | null
    away_score: number | null
    winner_team_id: number | null
    last_synced_at: string
    home_team: TeamRow
    away_team: TeamRow
}

const TEAM_COLUMNS = 'id, abbreviation, city, name, full_name'
const GAME_SELECT = [
    'id',
    'starts_at',
    'status',
    'period',
    'clock',
    'home_score',
    'away_score',
    'winner_team_id',
    'last_synced_at',
    `home_team:teams!home_team_id(${TEAM_COLUMNS})`,
    `away_team:teams!away_team_id(${TEAM_COLUMNS})`,
].join(', ')

function toTeam(row: TeamRow): Team {
    const team: Team = {
        id: row.id,
        abbreviation: row.abbreviation,
        city: row.city,
        name: row.name,
        fullName: row.full_name,
    }
    return team
}

function toGame(row: GameRow): Game {
    const game: Game = {
        id: row.id,
        startsAt: row.starts_at,
        status: row.status,
        period: row.period,
        clock: row.clock,
        homeTeam: toTeam(row.home_team),
        awayTeam: toTeam(row.away_team),
        homeScore: row.home_score,
        awayScore: row.away_score,
        winnerTeamId: row.winner_team_id,
        lastSyncedAt: row.last_synced_at,
    }
    return game
}

export async function fetchGamesByDate(roundDate: string): Promise<Game[]> {
    const client = getSupabaseClient()
    const { data, error } = await client
        .from('games')
        .select(GAME_SELECT)
        .eq('nba_date', roundDate)
        .order('starts_at', { ascending: true })
        .order('id', { ascending: true })
        .overrideTypes<GameRow[], { merge: false }>()

    if (error) {
        throw error
    }

    const games = data.map(toGame)
    return games
}
