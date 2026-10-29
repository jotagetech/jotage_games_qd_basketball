create table public.profiles (
    user_id uuid primary key references auth.users (id) on delete cascade,
    username text not null unique,
    display_name text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,20}$')
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy profiles_select_public on public.profiles
for select to anon, authenticated
using (true);

create policy profiles_update_own on public.profiles
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- O username é público e identifica o perfil na URL, então o cliente só
-- altera display_name; criação e remoção acontecem pelo gatilho e pelo cascade.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update (display_name) on public.profiles to authenticated;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (user_id, username)
    values (new.id, lower(btrim(new.raw_user_meta_data ->> 'username')));
    return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create function public.username_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select
        lower(btrim(candidate)) ~ '^[a-z0-9_]{3,20}$'
        and not exists (
            select 1
            from public.profiles
            where username = lower(btrim(candidate))
        );
$$;

revoke execute on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;
