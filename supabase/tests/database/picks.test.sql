begin;

create extension if not exists pgtap with schema extensions;

select plan(22);

select has_table('public', 'picks', 'picks existe');

select row_eq(
    $$select relrowsecurity from pg_class where oid = 'public.picks'::regclass$$,
    row (true),
    'RLS ligada em picks'
);

insert into public.teams (id, provider, provider_team_id, abbreviation, name, full_name)
overriding system value
values
    (9001, 'test', 't-a', 'TTA', 'Alfa', 'Time Alfa'),
    (9002, 'test', 't-b', 'TTB', 'Beta', 'Time Beta'),
    (9003, 'test', 't-c', 'TTC', 'Gama', 'Time Gama');

insert into public.games (
    id, provider, provider_game_id, season, nba_date, starts_at,
    home_team_id, away_team_id, status, last_synced_at
)
overriding system value
values
    (9101, 'test', 'g-future', 2026, current_date, now() + interval '2 hours', 9001, 9002, 'scheduled', now()),
    (9102, 'test', 'g-past', 2026, current_date, now() - interval '2 hours', 9001, 9002, 'scheduled', now()),
    (9103, 'test', 'g-live', 2026, current_date, now() + interval '2 hours', 9001, 9002, 'live', now()),
    (9104, 'test', 'g-other', 2026, current_date, now() + interval '2 hours', 9001, 9002, 'scheduled', now()),
    (9105, 'test', 'g-shared', 2026, current_date, now() + interval '2 hours', 9001, 9002, 'scheduled', now());

insert into auth.users (id, email, raw_user_meta_data)
values
    (
        '00000000-0000-0000-0000-0000000000a1',
        'ana@example.com',
        '{"username": "ana"}'
    ),
    (
        '00000000-0000-0000-0000-0000000000b2',
        'bia@example.com',
        '{"username": "bia"}'
    );

insert into public.picks (user_id, game_id, selected_team_id)
values
    ('00000000-0000-0000-0000-0000000000a1', 9105, 9001),
    ('00000000-0000-0000-0000-0000000000b2', 9105, 9002);

set local role authenticated;
select set_config(
    'request.jwt.claims',
    json_build_object(
        'sub', '00000000-0000-0000-0000-0000000000a1',
        'role', 'authenticated'
    )::text,
    true
);

select lives_ok(
    $$insert into public.picks (user_id, game_id, selected_team_id)
      values ('00000000-0000-0000-0000-0000000000a1', 9101, 9001)$$,
    'palpite antes do início entra'
);

select lives_ok(
    $$update public.picks set selected_team_id = 9002
      where user_id = '00000000-0000-0000-0000-0000000000a1' and game_id = 9101$$,
    'palpite antes do início troca'
);

select throws_ok(
    $$insert into public.picks (user_id, game_id, selected_team_id)
      values ('00000000-0000-0000-0000-0000000000a1', 9102, 9001)$$,
    'QD001',
    'palpite encerrado',
    'insert depois do início falha'
);

select throws_ok(
    $$insert into public.picks (user_id, game_id, selected_team_id)
      values ('00000000-0000-0000-0000-0000000000a1', 9103, 9001)$$,
    'QD001',
    'palpite encerrado',
    'insert em jogo que não está agendado falha'
);

select throws_ok(
    $$insert into public.picks (user_id, game_id, selected_team_id)
      values ('00000000-0000-0000-0000-0000000000a1', 9104, 9003)$$,
    'QD002',
    'time fora do jogo',
    'insert com time fora do jogo falha'
);

select throws_ok(
    $$update public.picks set selected_team_id = 9003
      where user_id = '00000000-0000-0000-0000-0000000000a1' and game_id = 9101$$,
    'QD002',
    'time fora do jogo',
    'troca para time fora do jogo falha'
);

select throws_ok(
    $$insert into public.picks (user_id, game_id, selected_team_id)
      values ('00000000-0000-0000-0000-0000000000b2', 9104, 9001)$$,
    '42501',
    null,
    'usuário não grava palpite de outro'
);

select throws_ok(
    $$insert into public.picks (user_id, game_id, selected_team_id)
      values ('00000000-0000-0000-0000-0000000000a1', 9101, 9001)$$,
    '23505',
    null,
    'palpite é único por usuário e jogo'
);

select throws_ok(
    $$update public.picks set game_id = 9104
      where user_id = '00000000-0000-0000-0000-0000000000a1' and game_id = 9101$$,
    '42501',
    null,
    'game_id não muda no update'
);

select throws_ok(
    $$update public.picks set user_id = '00000000-0000-0000-0000-0000000000b2'
      where user_id = '00000000-0000-0000-0000-0000000000a1' and game_id = 9101$$,
    '42501',
    null,
    'user_id não muda no update'
);

select throws_ok(
    $$delete from public.picks$$,
    '42501',
    null,
    'usuário não apaga palpite'
);

select is(
    (select count(*) from public.picks where game_id = 9105),
    1::bigint,
    'palpite alheio é invisível antes do início'
);

reset role;
update public.games set status = 'unavailable' where id = 9105;
set local role authenticated;

select is(
    (select count(*) from public.picks where game_id = 9105),
    1::bigint,
    'status indisponível antes do início não revela palpite alheio'
);

reset role;
update public.games set status = 'live' where id = 9105;
set local role authenticated;

select is(
    (select count(*) from public.picks where game_id = 9105),
    2::bigint,
    'jogo ao vivo revela palpite alheio mesmo antes do horário'
);

select throws_ok(
    $$update public.picks set selected_team_id = 9002
      where user_id = '00000000-0000-0000-0000-0000000000a1' and game_id = 9105$$,
    'QD001',
    'palpite encerrado',
    'update com o jogo ao vivo falha'
);

reset role;
update public.games set status = 'scheduled' where id = 9105;
set local role authenticated;

reset role;
update public.games set starts_at = now() - interval '1 hour' where id = 9105;
set local role authenticated;

select is(
    (select count(*) from public.picks where game_id = 9105),
    2::bigint,
    'palpite alheio fica visível depois do início'
);

select throws_ok(
    $$update public.picks set selected_team_id = 9002
      where user_id = '00000000-0000-0000-0000-0000000000a1' and game_id = 9105$$,
    'QD001',
    'palpite encerrado',
    'update depois do início falha'
);

select is_empty(
    $$with changed as (
          update public.picks set selected_team_id = 9001
          where user_id = '00000000-0000-0000-0000-0000000000b2' and game_id = 9105
          returning 1
      ) select * from changed$$,
    'usuário não troca palpite de outro'
);

reset role;
set local role anon;

select throws_ok(
    $$select * from public.picks$$,
    '42501',
    null,
    'anon não lê palpites'
);

select throws_ok(
    $$insert into public.picks (user_id, game_id, selected_team_id)
      values ('00000000-0000-0000-0000-0000000000a1', 9104, 9001)$$,
    '42501',
    null,
    'anon não grava palpites'
);

select * from finish();

rollback;
