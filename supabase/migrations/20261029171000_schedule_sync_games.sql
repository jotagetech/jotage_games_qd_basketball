create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create function private.invoke_sync_games()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    function_url text;
    function_secret text;
begin
    select decrypted_secret into function_url
    from vault.decrypted_secrets
    where name = 'sync_games_url';

    select decrypted_secret into function_secret
    from vault.decrypted_secrets
    where name = 'sync_games_secret';

    if function_url is null or function_secret is null then
        return;
    end if;

    perform net.http_post(
        url := function_url,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-sync-secret', function_secret
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 30000
    );
end;
$$;

revoke execute on function private.invoke_sync_games()
from public, anon, authenticated;

select cron.unschedule('sync-games')
where exists (select 1 from cron.job where jobname = 'sync-games');

select cron.schedule(
    'sync-games',
    '*/2 * * * *',
    'select private.invoke_sync_games()'
);
