create function public.sync_upsert_games(p_provider text, p_games jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
    games_written integer;
begin
    insert into public.teams (
        provider,
        provider_team_id,
        abbreviation,
        city,
        name,
        full_name,
        conference,
        division
    )
    select distinct on (team ->> 'providerTeamId')
        p_provider,
        team ->> 'providerTeamId',
        team ->> 'abbreviation',
        team ->> 'city',
        team ->> 'name',
        team ->> 'fullName',
        team ->> 'conference',
        team ->> 'division'
    from jsonb_array_elements(p_games) as game
    cross join lateral (
        values (game -> 'homeTeam'), (game -> 'awayTeam')
    ) as sides (team)
    on conflict (provider, provider_team_id) do update set
        abbreviation = excluded.abbreviation,
        city = excluded.city,
        name = excluded.name,
        full_name = excluded.full_name,
        conference = excluded.conference,
        division = excluded.division;

    with parsed as (
        select
            game ->> 'providerGameId' as provider_game_id,
            (game ->> 'season')::int as season,
            (game ->> 'postseason')::boolean as postseason,
            (game ->> 'nbaDate')::date as nba_date,
            (game ->> 'startsAt')::timestamptz as starts_at,
            game -> 'homeTeam' ->> 'providerTeamId' as home_provider_team_id,
            game -> 'awayTeam' ->> 'providerTeamId' as away_provider_team_id,
            game ->> 'status' as status,
            (game ->> 'period')::int as period,
            game ->> 'clock' as clock,
            (game ->> 'homeScore')::int as home_score,
            (game ->> 'awayScore')::int as away_score,
            case
                when jsonb_typeof(game -> 'homePeriodScores') = 'array'
                then array(
                    select jsonb_array_elements_text(game -> 'homePeriodScores')::int
                )
            end as home_period_scores,
            case
                when jsonb_typeof(game -> 'awayPeriodScores') = 'array'
                then array(
                    select jsonb_array_elements_text(game -> 'awayPeriodScores')::int
                )
            end as away_period_scores
        from jsonb_array_elements(p_games) as game
    ),
    resolved as (
        select
            parsed.*,
            home.id as home_team_id,
            away.id as away_team_id,
            case
                when parsed.status = 'final'
                    and parsed.home_score > parsed.away_score then home.id
                when parsed.status = 'final'
                    and parsed.away_score > parsed.home_score then away.id
            end as winner_team_id
        from parsed
        join public.teams as home
            on home.provider = p_provider
            and home.provider_team_id = parsed.home_provider_team_id
        join public.teams as away
            on away.provider = p_provider
            and away.provider_team_id = parsed.away_provider_team_id
    )
    insert into public.games (
        provider,
        provider_game_id,
        season,
        postseason,
        nba_date,
        starts_at,
        home_team_id,
        away_team_id,
        status,
        period,
        clock,
        home_score,
        away_score,
        home_period_scores,
        away_period_scores,
        winner_team_id,
        last_synced_at,
        finalized_at
    )
    select
        p_provider,
        provider_game_id,
        season,
        postseason,
        nba_date,
        starts_at,
        home_team_id,
        away_team_id,
        status,
        period,
        clock,
        home_score,
        away_score,
        home_period_scores,
        away_period_scores,
        winner_team_id,
        now(),
        case when winner_team_id is not null then now() end
    from resolved
    on conflict (provider, provider_game_id) do update set
        season = excluded.season,
        postseason = excluded.postseason,
        nba_date = excluded.nba_date,
        starts_at = excluded.starts_at,
        home_team_id = excluded.home_team_id,
        away_team_id = excluded.away_team_id,
        status = excluded.status,
        period = excluded.period,
        clock = excluded.clock,
        home_score = excluded.home_score,
        away_score = excluded.away_score,
        home_period_scores = excluded.home_period_scores,
        away_period_scores = excluded.away_period_scores,
        winner_team_id = excluded.winner_team_id,
        last_synced_at = excluded.last_synced_at,
        finalized_at = case
            when excluded.finalized_at is null then null
            else coalesce(public.games.finalized_at, excluded.finalized_at)
        end;

    get diagnostics games_written = row_count;
    return games_written;
end;
$$;

revoke execute on function public.sync_upsert_games(text, jsonb)
from public, anon, authenticated;
grant execute on function public.sync_upsert_games(text, jsonb)
to service_role;
