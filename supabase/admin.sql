-- 까모도로: 관리자 페이지와 VIP 표시 (백로그 I-015)
-- Supabase 대시보드 > SQL Editor에 붙여 넣고 한 번 실행합니다. (sync-tables.sql 다음에)
-- 실행한 뒤 맨 아래 "관리자 지정"을 본인 계정으로 한 번 실행합니다.
--
-- 브라우저는 공개 키만 쓰므로, 관리자 확인은 모두 서버(이 함수들)에서 합니다.
-- 화면에서 메뉴를 숨기는 것은 편의일 뿐이고, 관리자가 아니면 함수가 거부합니다.

-- 1. 관리자 목록 ---------------------------------------------------------
-- 브라우저에서는 읽지도 쓰지도 못합니다 (RLS를 켜고 규칙을 두지 않음).
-- 관리자는 이 SQL Editor에서만 넣고 뺍니다.
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- 2. VIP 표시 ------------------------------------------------------------
-- VIP는 프로필·메뉴에 배지로만 보입니다 (기능 차이 없음). 운영자가 관리자 페이지에서 켜고 끕니다.
create table public.vip_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  granted_at timestamptz not null default now(),
  -- 켠 관리자. 그 관리자 계정이 지워져도 VIP 표시는 남게
  granted_by uuid references auth.users (id) on delete set null
);

alter table public.vip_users enable row level security;

-- 본인이 VIP인지만 읽을 수 있음. 켜고 끄기는 아래 관리자 함수로만
create policy "vip_users: 본인 것만 읽기" on public.vip_users
for select to authenticated using ((select auth.uid()) = user_id);

-- 3. 관리자인지 ----------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 4. 회원 목록 (관리자만) ------------------------------------------------
-- 돌려주는 칸을 바꿀 때 다시 만들 수 있게 먼저 지움 (처음 실행할 때는 아무 일 없음)
drop function if exists public.admin_list_users();
create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  nickname text,
  provider text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  vip boolean,
  focus_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return query
  select
    u.id,
    u.email::text,
    coalesce(
      nullif(trim(u.raw_user_meta_data ->> 'nickname'), ''),
      nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
      split_part(u.email, '@', 1)
    )::text,
    (u.raw_app_meta_data ->> 'provider')::text,
    u.created_at,
    u.last_sign_in_at,
    exists (select 1 from public.vip_users v where v.user_id = u.id),
    (select count(*) from public.sessions s where s.user_id = u.id and s.mode = 'focus')
  from auth.users u
  order by u.created_at desc;
end;
$$;

revoke all on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;

-- 5. 간단한 통계 (관리자만) ----------------------------------------------
create or replace function public.admin_stats()
returns table (
  total_users bigint,
  vip_users bigint,
  new_users_7d bigint,
  active_users_7d bigint,
  focus_sessions_7d bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return query
  select
    (select count(*) from auth.users),
    (select count(*) from public.vip_users),
    (select count(*) from auth.users where created_at >= now() - interval '7 days'),
    (select count(distinct user_id) from public.sessions
      where mode = 'focus' and ended_at >= now() - interval '7 days'),
    (select count(*) from public.sessions
      where mode = 'focus' and ended_at >= now() - interval '7 days');
end;
$$;

revoke all on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;

-- 6. VIP 켜고 끄기 (관리자만) --------------------------------------------
create or replace function public.admin_set_vip(target uuid, on_vip boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if on_vip then
    insert into public.vip_users (user_id, granted_by)
    values (target, auth.uid())
    on conflict (user_id) do nothing;
  else
    delete from public.vip_users where user_id = target;
  end if;
end;
$$;

revoke all on function public.admin_set_vip(uuid, boolean) from public, anon;
grant execute on function public.admin_set_vip(uuid, boolean) to authenticated;

-- 7. 관리자 지정 (본인 계정으로 한 번) -----------------------------------
-- 아래 이메일을 본인 로그인 이메일로 바꿔 실행합니다. (카카오에서 이메일을 받지 않았다면
-- Authentication > Users에서 본인 행의 UID를 복사해 user_id에 직접 넣습니다)
--
-- insert into public.admins (user_id)
-- select id from auth.users where email = '본인 이메일';
