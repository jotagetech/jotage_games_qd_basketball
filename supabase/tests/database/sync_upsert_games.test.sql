begin;

create extension if not exists pgtap with schema extensions;

select plan(18);

create function pg_temp.game(
    p_id text,
    p_status text,
    p_home_score int,
    p_away_score int
)
returns jsonb
language sql
as $$
    select jsonb_build_object(
        'providerGameId', p_id,
        'season', 2026,
        'postseason', false,
        'nbaDate', '2026-10-28',
        'startsAt', '2026-10-28T23:00:00.000Z',
        'homeTeam', jsonb_build_object(
            'providerTeamId', 'team-a',
            'abbreviation', 'AAA',
            'city', 'Alpha',
            'name', 'Alphas',
            'fullName', 'Alpha Alphas',
            'conference', 'East',
            'division', 'Central'
        ),
        'awayTeam', jsonb_build_object(
            'providerTeamId', 'team-b',
            'abbreviation', 'BBB',
            'city', 'Beta',
            'name', 'Betas',
            'fullName', 'Beta Betas',
            'conference', 'West',
            'division', 'Pacific'
        ),
        'status', p_status,
        'period', case when p_status = 'scheduled' then null else 4 end,
        'clock', null,
        'homeScore', p_home_score,
        'awayScore', p_away_score,
        'homePeriodScores', case
            when p_home_score is null then null
            else jsonb_build_array(p_home_score)
        end,
        'awayPeriodScores', case
            when p_away_score is null then null
            else jsonb_build_array(p_away_score)
        end
    );
$$;

create function pg_temp.winner_provider_team_id(p_game_id text)
returns text
language sql
as $$
    select winner.provider_team_id
    from public.games as game
    join public.teams as winner on winner.id = game.winner_team_id
    where game.provider = 'test' and game.provider_game_id = p_game_id;
$$;

select is(
    public.sync_upsert_games(
        'test',
        jsonb_build_array(
            pg_temp.game('g1', 'final', 100, 90),
            pg_temp.game('g2', 'scheduled', null, null)
        )
    ),
    2,
    'devolve quantos jogos gravou'
);

select is(
    public.sync_upsert_games(
        'test',
        jsonb_build_array(
            pg_temp.game('g1', 'final', 100, 90),
            pg_temp.game('g2', 'scheduled', null, null)
        )
    ),
    2,
    'segunda execução devolve a mesma contagem'
);

select is(
    (select count(*)::int from public.games where provider = 'test'),
    2,
    'upsert repetido não duplica jogos'
);

select is(
    (select count(*)::int from public.teams where provider = 'test'),
    2,
    'upsert repetido não duplica times'
);

select is(
    pg_temp.winner_provider_team_id('g1'),
    'team-a',
    'vence quem fez mais pontos no jogo final'
);

select is(
    (
        select winner_team_id
        from public.games
        where provider = 'test' and provider_game_id = 'g2'
    ),
    null,
    'jogo agendado não tem vencedor'
);

select isnt(
    (
        select finalized_at
        from public.games
        where provider = 'test' and provider_game_id = 'g1'
    ),
    null,
    'jogo final ganha finalized_at'
);

select is(
    (
        select finalized_at
        from public.games
        where provider = 'test' and provider_game_id = 'g2'
    ),
    null,
    'jogo agendado fica sem finalized_at'
);

select is(
    (
        select home_score
        from public.games
        where provider = 'test' and provider_game_id = 'g2'
    ),
    null,
    'jogo agendado fica sem placar'
);

update public.games
set finalized_at = '2020-01-01T00:00:00Z'
where provider = 'test' and provider_game_id = 'g1';

select public.sync_upsert_games(
    'test',
    jsonb_build_array(pg_temp.game('g1', 'final', 100, 90))
);

select is(
    (
        select finalized_at
        from public.games
        where provider = 'test' and provider_game_id = 'g1'
    ),
    '2020-01-01T00:00:00Z'::timestamptz,
    'nova execução não muda finalized_at já gravado'
);

select public.sync_upsert_games(
    'test',
    jsonb_build_array(pg_temp.game('g1', 'final', 90, 100))
);

select is(
    pg_temp.winner_provider_team_id('g1'),
    'team-b',
    'correção de placar troca o vencedor'
);

select is(
    (
        select home_score
        from public.games
        where provider = 'test' and provider_game_id = 'g1'
    ),
    90,
    'correção de placar atualiza o placar'
);

select public.sync_upsert_games(
    'test',
    jsonb_build_array(pg_temp.game('g1', 'live', 50, 48))
);

select is(
    (
        select finalized_at
        from public.games
        where provider = 'test' and provider_game_id = 'g1'
    ),
    null,
    'final que volta a ao vivo limpa finalized_at'
);

select is(
    pg_temp.winner_provider_team_id('g1'),
    null,
    'final que volta a ao vivo limpa o vencedor'
);

select public.sync_upsert_games(
    'test',
    jsonb_build_array(pg_temp.game('g1', 'final', 80, 80))
);

select is(
    (
        select finalized_at
        from public.games
        where provider = 'test' and provider_game_id = 'g1'
    ),
    null,
    'final empatado não é finalizado'
);

select ok(
    not has_function_privilege(
        'anon', 'public.sync_upsert_games(text, jsonb)', 'execute'
    ),
    'anon não executa'
);

select ok(
    not has_function_privilege(
        'authenticated', 'public.sync_upsert_games(text, jsonb)', 'execute'
    ),
    'authenticated não executa'
);

select ok(
    has_function_privilege(
        'service_role', 'public.sync_upsert_games(text, jsonb)', 'execute'
    ),
    'service_role executa'
);

select * from finish();

rollback;
