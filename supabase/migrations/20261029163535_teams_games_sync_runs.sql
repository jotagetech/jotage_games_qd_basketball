create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create table public.teams (
    id bigint generated always as identity primary key,
    provider text not null,
    provider_team_id text not null,
    abbreviation text not null,
    city text,
    name text not null,
    full_name text not null,
    conference text,
    division text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (provider, provider_team_id)
);

create table public.games (
    id bigint generated always as identity primary key,
    provider text not null,
    provider_game_id text not null,
    season int not null,
    postseason boolean not null default false,
    nba_date date not null,
    starts_at timestamptz not null,
    home_team_id bigint not null references public.teams (id),
    away_team_id bigint not null references public.teams (id),
    status text not null check (
        status in (
            'scheduled',
            'live',
            'final',
            'postponed',
            'canceled',
            'unavailable'
        )
    ),
    period int,
    clock text,
    home_score int check (home_score >= 0),
    away_score int check (away_score >= 0),
    home_period_scores int[],
    away_period_scores int[],
    winner_team_id bigint references public.teams (id),
    last_synced_at timestamptz not null,
    finalized_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (provider, provider_game_id),
    constraint games_distinct_teams check (home_team_id <> away_team_id),
    constraint games_winner_plays check (
        winner_team_id is null
        or winner_team_id = home_team_id
        or winner_team_id = away_team_id
    ),
    constraint games_finalized_is_final check (
        finalized_at is null
        or (status = 'final' and winner_team_id is not null)
    )
);

create index games_nba_date_idx on public.games (nba_date);
create index games_starts_at_idx on public.games (starts_at);
create index games_home_team_id_idx on public.games (home_team_id);
create index games_away_team_id_idx on public.games (away_team_id);
create index games_winner_team_id_idx on public.games (winner_team_id);

create table public.sync_runs (
    id bigint generated always as identity primary key,
    provider text not null,
    started_at timestamptz not null default now(),
    finished_at timestamptz,
    status text not null check (status in ('running', 'success', 'error')),
    error_message text,
    requests_made int,
    teams_upserted int,
    games_upserted int,
    window_start date,
    window_end date
);

create trigger teams_set_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

create trigger games_set_updated_at
before update on public.games
for each row execute function public.set_updated_at();

alter table public.teams enable row level security;
alter table public.games enable row level security;
alter table public.sync_runs enable row level security;

create policy teams_select_public on public.teams
for select to anon, authenticated
using (true);

create policy games_select_public on public.games
for select to anon, authenticated
using (true);

-- Os privilégios padrão do schema public dão tudo a anon e authenticated;
-- aqui eles ficam só com a leitura, sem depender da ausência de política.
revoke all on public.teams, public.games, public.sync_runs from anon, authenticated;
grant select on public.teams, public.games to anon, authenticated;
revoke all on sequence public.teams_id_seq, public.games_id_seq, public.sync_runs_id_seq
from anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
