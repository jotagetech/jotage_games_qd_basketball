begin;

create extension if not exists pgtap with schema extensions;

select plan(16);

select has_table('public', 'profiles', 'profiles existe');

select row_eq(
    $$select relrowsecurity from pg_class where oid = 'public.profiles'::regclass$$,
    row (true),
    'RLS ligada em profiles'
);

insert into auth.users (id, email, raw_user_meta_data)
values
    (
        '00000000-0000-0000-0000-0000000000a1',
        'ana@example.com',
        '{"username": "  Ana_Silva "}'
    ),
    (
        '00000000-0000-0000-0000-0000000000b2',
        'bia@example.com',
        '{"username": "bia"}'
    );

select is(
    (select username from public.profiles
     where user_id = '00000000-0000-0000-0000-0000000000a1'),
    'ana_silva',
    'cadastro cria o perfil com o apelido normalizado'
);

select throws_ok(
    $$insert into auth.users (id, email, raw_user_meta_data)
      values (gen_random_uuid(), 'dup@example.com', '{"username": "ANA_SILVA"}')$$,
    '23505',
    null,
    'apelido repetido faz o cadastro falhar'
);

select throws_ok(
    $$insert into auth.users (id, email, raw_user_meta_data)
      values (gen_random_uuid(), 'curto@example.com', '{"username": "ab"}')$$,
    '23514',
    null,
    'apelido curto faz o cadastro falhar'
);

select throws_ok(
    $$insert into auth.users (id, email, raw_user_meta_data)
      values (gen_random_uuid(), 'char@example.com', '{"username": "ana-silva"}')$$,
    '23514',
    null,
    'apelido com caractere inválido faz o cadastro falhar'
);

select throws_ok(
    $$insert into auth.users (id, email, raw_user_meta_data)
      values (gen_random_uuid(), 'sem@example.com', '{}')$$,
    '23502',
    null,
    'cadastro sem apelido falha'
);

select is(
    (select count(*) from public.profiles where user_id is not null),
    2::bigint,
    'cadastros recusados não deixam perfil'
);

set local role anon;

select is(
    (select count(*) from public.profiles),
    2::bigint,
    'anon lê profiles'
);

select is(
    public.username_available('livre_01'),
    true,
    'apelido livre está disponível'
);

select is(
    public.username_available('ANA_SILVA'),
    false,
    'apelido em uso não está disponível'
);

select is(
    public.username_available('a!'),
    false,
    'apelido inválido não está disponível'
);

reset role;
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
    $$update public.profiles set display_name = 'Ana'
      where user_id = '00000000-0000-0000-0000-0000000000a1'$$,
    'usuário altera o próprio display_name'
);

select throws_ok(
    $$update public.profiles set username = 'outro'
      where user_id = '00000000-0000-0000-0000-0000000000a1'$$,
    '42501',
    null,
    'usuário não altera o username'
);

select is_empty(
    $$with changed as (
          update public.profiles set display_name = 'Invasão'
          where user_id = '00000000-0000-0000-0000-0000000000b2'
          returning 1
      ) select * from changed$$,
    'usuário não altera o display_name de outro'
);

select throws_ok(
    $$delete from public.profiles$$,
    '42501',
    null,
    'usuário não apaga perfil'
);

select * from finish();

rollback;
