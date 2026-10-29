begin;

create extension if not exists pgtap with schema extensions;

select plan(28);

select has_table('public', 'teams', 'teams existe');
select has_table('public', 'games', 'games existe');
select has_table('public', 'sync_runs', 'sync_runs existe');

select columns_are(
    'public',
    'teams',
    array[
        'id', 'provider', 'provider_team_id', 'abbreviation', 'city', 'name',
        'full_name', 'conference', 'division', 'created_at', 'updated_at'
    ],
    'colunas de teams'
);

select columns_are(
    'public',
    'games',
    array[
        'id', 'provider', 'provider_game_id', 'season', 'postseason',
        'nba_date', 'starts_at', 'home_team_id', 'away_team_id', 'status',
        'period', 'clock', 'home_score', 'away_score', 'home_period_scores',
        'away_period_scores', 'winner_team_id', 'last_synced_at',
        'finalized_at', 'created_at', 'updated_at'
    ],
    'colunas de games'
);

select columns_are(
    'public',
    'sync_runs',
    array[
        'id', 'provider', 'started_at', 'finished_at', 'status',
        'error_message', 'requests_made', 'teams_upserted', 'games_upserted',
        'window_start', 'window_end'
    ],
    'colunas de sync_runs'
);

select row_eq(
    $$select relrowsecurity from pg_class where oid = 'public.teams'::regclass$$,
    row (true),
    'RLS ligada em teams'
);
select row_eq(
    $$select relrowsecurity from pg_class where oid = 'public.games'::regclass$$,
    row (true),
    'RLS ligada em games'
);
select row_eq(
    $$select relrowsecurity from pg_class where oid = 'public.sync_runs'::regclass$$,
    row (true),
    'RLS ligada em sync_runs'
);

insert into public.teams (provider, provider_team_id, abbreviation, name, full_name)
values
    ('test', '1', 'AAA', 'Alfas', 'Cidade Alfas'),
    ('test', '2', 'BBB', 'Betas', 'Cidade Betas'),
    ('test', '3', 'CCC', 'Gamas', 'Cidade Gamas');

insert into public.games (
    provider, provider_game_id, season, nba_date, starts_at,
    home_team_id, away_team_id, status, last_synced_at
)
select
    'test', 'g1', 2026, date '2026-10-29', timestamptz '2026-10-30 00:00+00',
    home.id, away.id, 'scheduled', now()
from public.teams as home, public.teams as away
where home.provider_team_id = '1' and away.provider_team_id = '2';

insert into public.sync_runs (provider, status) values ('test', 'running');

set local role anon;

select is(
    (select count(*) from public.teams),
    3::bigint,
    'anon lê teams'
);
select is(
    (select count(*) from public.games),
    1::bigint,
    'anon lê games'
);

select throws_ok(
    $$insert into public.teams (provider, provider_team_id, abbreviation, name, full_name)
      values ('x', '9', 'ZZZ', 'Z', 'Z Z')$$,
    '42501',
    null,
    'anon não insere em teams'
);
select throws_ok(
    $$update public.games set period = 1$$,
    '42501',
    null,
    'anon não altera games'
);
select throws_ok(
    $$select count(*) from public.sync_runs$$,
    '42501',
    null,
    'anon não lê sync_runs'
);

reset role;
set local role authenticated;

select throws_ok(
    $$insert into public.teams (provider, provider_team_id, abbreviation, name, full_name)
      values ('x', '9', 'ZZZ', 'Z', 'Z Z')$$,
    '42501',
    null,
    'authenticated não insere em teams'
);
select throws_ok(
    $$update public.teams set city = 'X'$$,
    '42501',
    null,
    'authenticated não altera teams'
);
select throws_ok(
    $$insert into public.games (
        provider, provider_game_id, season, nba_date, starts_at,
        home_team_id, away_team_id, status, last_synced_at
      ) values ('x', 'g', 2026, current_date, now(), 1, 2, 'scheduled', now())$$,
    '42501',
    null,
    'authenticated não insere em games'
);
select throws_ok(
    $$delete from public.games$$,
    '42501',
    null,
    'authenticated não apaga games'
);
select throws_ok(
    $$insert into public.sync_runs (provider, status) values ('x', 'running')$$,
    '42501',
    null,
    'authenticated não insere em sync_runs'
);

reset role;

select throws_ok(
    $$insert into public.games (
        provider, provider_game_id, season, nba_date, starts_at,
        home_team_id, away_team_id, status, last_synced_at
      )
      select 'test', 'g2', 2026, current_date, now(), id, id, 'scheduled', now()
      from public.teams where provider_team_id = '1'$$,
    '23514',
    null,
    'jogo com o mesmo time nos dois lados é recusado'
);

select throws_ok(
    $$update public.games set finalized_at = now()$$,
    '23514',
    null,
    'finalized_at sem estado final é recusado'
);

select throws_ok(
    $$update public.games
      set winner_team_id = (
          select id from public.teams where provider_team_id = '3'
      )$$,
    '23514',
    null,
    'vencedor que não joga a partida é recusado'
);

select throws_ok(
    $$insert into public.games (
        provider, provider_game_id, season, nba_date, starts_at,
        home_team_id, away_team_id, status, last_synced_at
      )
      select 'test', 'g1', 2026, current_date, now(), home.id, away.id,
          'scheduled', now()
      from public.teams as home, public.teams as away
      where home.provider_team_id = '1' and away.provider_team_id = '2'$$,
    '23505',
    null,
    'par provedor e id de jogo repetido é recusado'
);

select throws_ok(
    $$insert into public.teams (provider, provider_team_id, abbreviation, name, full_name)
      values ('test', '1', 'AAA', 'Alfas', 'Cidade Alfas')$$,
    '23505',
    null,
    'par provedor e id de time repetido é recusado'
);

select throws_ok(
    $$update public.games set status = 'adiado'$$,
    '23514',
    null,
    'status fora da lista é recusado'
);

select lives_ok(
    $$update public.games
      set status = 'final',
          winner_team_id = home_team_id,
          finalized_at = now()$$,
    'jogo final com vencedor aceita finalized_at'
);

update public.games set updated_at = timestamptz '2000-01-01 00:00+00';

select is(
    (select updated_at > timestamptz '2000-01-01 00:00+00' from public.games),
    true,
    'updated_at muda no update de games'
);

update public.teams set updated_at = timestamptz '2000-01-01 00:00+00';
update public.teams set city = 'Cidade';

select is(
    (select min(updated_at) > timestamptz '2000-01-01 00:00+00' from public.teams),
    true,
    'updated_at muda no update de teams'
);

select * from finish();

rollback;
