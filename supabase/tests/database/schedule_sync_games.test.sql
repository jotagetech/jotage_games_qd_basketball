begin;

create extension if not exists pgtap with schema extensions;

select plan(6);

select is(
    (select schedule from cron.job where jobname = 'sync-games'),
    '*/2 * * * *',
    'o job sync-games roda a cada 2 minutos'
);

select is(
    (select command from cron.job where jobname = 'sync-games'),
    'select private.invoke_sync_games()',
    'o job chama a função do schema private'
);

select is(
    (select count(*)::int from cron.job where jobname = 'sync-games'),
    1,
    'existe um só job sync-games'
);

delete from vault.secrets
where name in ('sync_games_url', 'sync_games_secret');

select lives_ok(
    'select private.invoke_sync_games()',
    'sem segredos no Vault a função sai sem falhar'
);

select ok(
    not has_schema_privilege('anon', 'private', 'usage'),
    'anon não usa o schema private'
);

select ok(
    not has_schema_privilege('authenticated', 'private', 'usage'),
    'authenticated não usa o schema private'
);

select * from finish();

rollback;
