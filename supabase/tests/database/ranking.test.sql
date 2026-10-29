begin;

create extension if not exists pgtap with schema extensions;

select plan(8);

select has_function('public', 'ranking', array[]::text[], 'ranking existe');

insert into public.teams (id, provider, provider_team_id, abbreviation, name, full_name)
overriding system value
values
    (9001, 'test', 't-a', 'TTA', 'Alfa', 'Time Alfa'),
    (9002, 'test', 't-b', 'TTB', 'Beta', 'Time Beta');

insert into public.games (
    id, provider, provider_game_id, season, nba_date, starts_at,
    home_team_id, away_team_id, status, last_synced_at
)
overriding system value
select
    9100 + game_number,
    'test',
    'g-' || game_number,
    2026,
    current_date,
    now() + interval '2 hours',
    9001,
    9002,
    'scheduled',
    now()
from generate_series(1, 7) as game_number;

insert into auth.users (id, email, raw_user_meta_data)
values
    ('00000000-0000-0000-0000-0000000000a1', 'ana@example.com', '{"username": "ana"}'),
    ('00000000-0000-0000-0000-0000000000b2', 'bia@example.com', '{"username": "bia"}'),
    ('00000000-0000-0000-0000-0000000000c3', 'cai@example.com', '{"username": "cai"}'),
    ('00000000-0000-0000-0000-0000000000d4', 'dan@example.com', '{"username": "dan"}'),
    ('00000000-0000-0000-0000-0000000000e5', 'eva@example.com', '{"username": "eva"}');

-- Jogos 1 e 2 vencem 9001, jogo 3 vence 9002 e jogo 4 vence 9002.
-- Ana: 9001, 9001, 9002. Bia e Dan: 9001 nos três. Cai: 9001 nos quatro.
insert into public.picks (user_id, game_id, selected_team_id)
values
    ('00000000-0000-0000-0000-0000000000a1', 9101, 9001),
    ('00000000-0000-0000-0000-0000000000a1', 9102, 9001),
    ('00000000-0000-0000-0000-0000000000a1', 9103, 9002),
    ('00000000-0000-0000-0000-0000000000b2', 9101, 9001),
    ('00000000-0000-0000-0000-0000000000b2', 9102, 9001),
    ('00000000-0000-0000-0000-0000000000b2', 9103, 9001),
    ('00000000-0000-0000-0000-0000000000d4', 9101, 9001),
    ('00000000-0000-0000-0000-0000000000d4', 9102, 9001),
    ('00000000-0000-0000-0000-0000000000d4', 9103, 9001),
    ('00000000-0000-0000-0000-0000000000c3', 9101, 9001),
    ('00000000-0000-0000-0000-0000000000c3', 9102, 9001),
    ('00000000-0000-0000-0000-0000000000c3', 9103, 9001),
    ('00000000-0000-0000-0000-0000000000c3', 9104, 9001),
    ('00000000-0000-0000-0000-0000000000e5', 9105, 9001),
    ('00000000-0000-0000-0000-0000000000e5', 9106, 9001),
    ('00000000-0000-0000-0000-0000000000e5', 9107, 9001);

update public.games
set status = 'final', winner_team_id = 9001, finalized_at = now()
where id in (9101, 9102);

update public.games
set status = 'final', winner_team_id = 9002, finalized_at = now()
where id in (9103, 9104);

update public.games set status = 'postponed' where id = 9106;
update public.games set status = 'live' where id = 9107;

select results_eq(
    $$select "position", username, wins, losses from public.ranking()$$,
    $$values
        (1::bigint, 'ana'::text, 3::bigint, 0::bigint),
        (2::bigint, 'bia'::text, 2::bigint, 1::bigint),
        (2::bigint, 'dan'::text, 2::bigint, 1::bigint),
        (4::bigint, 'cai'::text, 2::bigint, 2::bigint)$$,
    'acertos e erros contados, empate dividido e ordem por acertos, taxa, erros e apelido'
);

select results_eq(
    $$select username, round(win_rate, 4) from public.ranking() order by username$$,
    $$values
        ('ana'::text, 1.0000::numeric),
        ('bia'::text, 0.6667::numeric),
        ('cai'::text, 0.5000::numeric),
        ('dan'::text, 0.6667::numeric)$$,
    'taxa é acertos sobre julgados'
);

select is_empty(
    $$select 1 from public.ranking() where username = 'eva'$$,
    'jogo agendado, adiado ou ao vivo não conta'
);

update public.games set winner_team_id = 9001 where id = 9103;

select results_eq(
    $$select "position", username, wins, losses from public.ranking()$$,
    $$values
        (1::bigint, 'bia'::text, 3::bigint, 0::bigint),
        (1::bigint, 'dan'::text, 3::bigint, 0::bigint),
        (3::bigint, 'cai'::text, 3::bigint, 1::bigint),
        (4::bigint, 'ana'::text, 2::bigint, 1::bigint)$$,
    'correção de vencedor muda a contagem'
);

update public.games set status = 'scheduled', winner_team_id = null, finalized_at = null
where id = 9104;

select results_eq(
    $$select username, wins, losses from public.ranking() where username = 'cai'$$,
    $$values ('cai'::text, 3::bigint, 0::bigint)$$,
    'jogo que deixa de ser final sai da contagem'
);

set local role anon;

select lives_ok(
    $$select * from public.ranking()$$,
    'anon executa o ranking'
);

select results_eq(
    $$select count(*) from public.ranking()$$,
    $$values (4::bigint)$$,
    'anon recebe o ranking sem acesso direto aos palpites'
);

reset role;

select * from finish();

rollback;
