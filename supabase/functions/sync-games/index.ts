import { createClient } from 'npm:@supabase/supabase-js@2'
import { createBalldontlieProvider } from './providers/balldontlie.ts'
import type { ProviderGame } from './providers/types.ts'
import { buildGameWindow } from './providers/window.ts'

const SECRET_HEADER = 'x-sync-secret'
const HTTP_UNAUTHORIZED = 401
const HTTP_SERVER_ERROR = 500
// Execução que passou disso sem fechar morreu no meio (limite do runtime ou deploy).
const STALE_RUN_MINUTES = 10
const MS_PER_MINUTE = 60_000

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
    const response = new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    })
    return response
}

function countDistinctTeams(games: ProviderGame[]): number {
    const teamIds = new Set<string>()
    for (const game of games) {
        teamIds.add(game.homeTeam.providerTeamId)
        teamIds.add(game.awayTeam.providerTeamId)
    }
    return teamIds.size
}

function describeError(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error)
    return message
}

async function handleSync(request: Request): Promise<Response> {
    const expectedSecret = Deno.env.get('SYNC_SECRET')
    const receivedSecret = request.headers.get(SECRET_HEADER)
    if (!expectedSecret || receivedSecret !== expectedSecret) {
        return jsonResponse({ error: 'unauthorized' }, HTTP_UNAUTHORIZED)
    }

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )
    const provider = createBalldontlieProvider(
        Deno.env.get('BALLDONTLIE_API_KEY') ?? '',
        fetch,
    )
    const window = buildGameWindow(new Date())

    const staleBefore = new Date(Date.now() - STALE_RUN_MINUTES * MS_PER_MINUTE)
    await supabase
        .from('sync_runs')
        .update({
            status: 'error',
            finished_at: new Date().toISOString(),
            error_message: 'execução interrompida antes de terminar',
        })
        .eq('status', 'running')
        .lt('started_at', staleBefore.toISOString())

    const { data: run, error: openError } = await supabase
        .from('sync_runs')
        .insert({
            provider: provider.name,
            status: 'running',
            window_start: window.startDate,
            window_end: window.endDate,
        })
        .select('id')
        .single()
    if (openError) {
        return jsonResponse({ error: openError.message }, HTTP_SERVER_ERROR)
    }

    try {
        const { games, requestsMade } = await provider.fetchGames(window)
        const { data: gamesUpserted, error: upsertError } = await supabase.rpc(
            'sync_upsert_games',
            { p_provider: provider.name, p_games: games },
        )
        if (upsertError) throw new Error(upsertError.message)

        const summary = {
            requests_made: requestsMade,
            teams_upserted: countDistinctTeams(games),
            games_upserted: gamesUpserted,
        }
        const { error: closeError } = await supabase
            .from('sync_runs')
            .update({
                status: 'success',
                finished_at: new Date().toISOString(),
                ...summary,
            })
            .eq('id', run.id)
        if (closeError) throw new Error(closeError.message)
        return jsonResponse({ status: 'success', ...summary })
    } catch (error) {
        const message = describeError(error)
        const { error: closeError } = await supabase
            .from('sync_runs')
            .update({
                status: 'error',
                finished_at: new Date().toISOString(),
                error_message: message,
            })
            .eq('id', run.id)
        const details = closeError ? `${message}; ${closeError.message}` : message
        return jsonResponse({ status: 'error', error: details }, HTTP_SERVER_ERROR)
    }
}

Deno.serve(handleSync)
