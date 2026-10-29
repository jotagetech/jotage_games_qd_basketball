import { getSupabaseClient } from '@/shared/api'

interface PickRow {
    game_id: number
    selected_team_id: number
}

const UNIQUE_VIOLATION_CODE = '23505'

export type PicksByGame = Readonly<Record<number, number>>

export async function fetchPicks(userId: string, gameIds: readonly number[]): Promise<PicksByGame> {
    if (gameIds.length === 0) {
        return {}
    }

    const { data, error } = await getSupabaseClient()
        .from('picks')
        .select('game_id, selected_team_id')
        .eq('user_id', userId)
        .in('game_id', [...gameIds])
        .overrideTypes<PickRow[], { merge: false }>()

    if (error) {
        throw error
    }

    const picks: Record<number, number> = {}
    for (const row of data) {
        picks[row.game_id] = row.selected_team_id
    }
    return picks
}

/**
 * O cliente só tem permissão de alterar `selected_team_id`, então o upsert do
 * PostgREST (que reescreve user_id e game_id) é recusado: troca por update e,
 * se não havia palpite, insere.
 */
export async function savePick(userId: string, gameId: number, teamId: number): Promise<void> {
    const changed = await updatePick(userId, gameId, teamId)
    if (changed) {
        return
    }

    const { error } = await getSupabaseClient()
        .from('picks')
        .insert({ user_id: userId, game_id: gameId, selected_team_id: teamId })

    if (!error) {
        return
    }

    if (error.code !== UNIQUE_VIOLATION_CODE) {
        throw error
    }

    // Outro envio criou o palpite entre o update e o insert: troca o time nele.
    const changedAfterConflict = await updatePick(userId, gameId, teamId)
    if (!changedAfterConflict) {
        throw error
    }
}

async function updatePick(userId: string, gameId: number, teamId: number): Promise<boolean> {
    const { data, error } = await getSupabaseClient()
        .from('picks')
        .update({ selected_team_id: teamId })
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .select('id')

    if (error) {
        throw error
    }

    const changed = data.length > 0
    return changed
}
