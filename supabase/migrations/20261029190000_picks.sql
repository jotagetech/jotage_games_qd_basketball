create table public.picks (
    id bigint generated always as identity primary key,
    user_id uuid not null references auth.users (id) on delete cascade,
    game_id bigint not null references public.games (id) on delete cascade,
    selected_team_id bigint not null references public.teams (id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, game_id)
);

create index picks_game_id_idx on public.picks (game_id);
create index picks_selected_team_id_idx on public.picks (selected_team_id);

create trigger picks_set_updated_at
before update on public.picks
for each row execute function public.set_updated_at();

-- Os erros levam errcode próprio para o cliente distinguir a recusa de regra
-- de uma falha qualquer do banco.
create function public.guard_pick()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    target_game public.games;
begin
    select * into target_game from public.games where id = new.game_id;

    if target_game.status <> 'scheduled' or now() >= target_game.starts_at then
        raise exception 'palpite encerrado' using errcode = 'QD001';
    end if;

    if new.selected_team_id not in (target_game.home_team_id, target_game.away_team_id) then
        raise exception 'time fora do jogo' using errcode = 'QD002';
    end if;

    return new;
end;
$$;

revoke execute on function public.guard_pick() from public, anon, authenticated;

create trigger picks_guard
before insert or update on public.picks
for each row execute function public.guard_pick();

alter table public.picks enable row level security;

create policy picks_select_visible on public.picks
for select to authenticated
using (
    auth.uid() = user_id
    or exists (
        select 1
        from public.games
        where games.id = picks.game_id
            -- Só início real revela palpites alheios: indisponível ou adiado pode
            -- voltar a agendado e reabrir o palpite de quem já teria visto os outros.
            and (games.starts_at <= now() or games.status in ('live', 'final'))
    )
);

create policy picks_insert_own on public.picks
for insert to authenticated
with check (auth.uid() = user_id);

create policy picks_update_own on public.picks
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- O cliente só troca o time escolhido; dono e jogo ficam fixos depois do
-- insert, e a remoção acontece apenas pelo cascade.
revoke all on public.picks from anon, authenticated;
grant select on public.picks to authenticated;
grant insert (user_id, game_id, selected_team_id) on public.picks to authenticated;
grant update (selected_team_id) on public.picks to authenticated;
revoke all on sequence public.picks_id_seq from anon, authenticated;
