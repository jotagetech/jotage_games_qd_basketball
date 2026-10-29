-- Ranking derivado dos palpites e dos resultados na hora da consulta: não há
-- pontuação gravada, então correção de resultado pela sincronização se reflete
-- sozinha. Só jogo final com vencedor conta, o que também impede expor palpite
-- de jogo que ainda pode receber palpite.
create function public.ranking()
returns table (
    "position" bigint,
    username text,
    wins bigint,
    losses bigint,
    win_rate numeric
)
language sql
stable
security definer
set search_path = ''
as $$
    with judged as (
        select
            picks.user_id,
            count(*) filter (where picks.selected_team_id = games.winner_team_id) as wins,
            count(*) filter (where picks.selected_team_id <> games.winner_team_id) as losses
        from public.picks
        join public.games on games.id = picks.game_id
        where games.status = 'final'
            and games.winner_team_id is not null
        group by picks.user_id
    ),
    scored as (
        select
            profiles.username,
            judged.wins,
            judged.losses,
            judged.wins::numeric / (judged.wins + judged.losses) as win_rate
        from judged
        join public.profiles on profiles.user_id = judged.user_id
    )
    select
        rank() over (order by scored.wins desc, scored.win_rate desc, scored.losses asc),
        scored.username,
        scored.wins,
        scored.losses,
        scored.win_rate
    from scored
    order by 1, scored.username;
$$;

revoke execute on function public.ranking() from public;
grant execute on function public.ranking() to anon, authenticated;
