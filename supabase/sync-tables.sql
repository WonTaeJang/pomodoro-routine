-- 까모도로: 로그인 계정에 저장하는 표 (백로그 I-027)
-- Supabase 대시보드 > SQL Editor에 통째로 붙여 넣고 한 번 실행합니다.
-- 표 3개: 할 일(tasks), 집중 기록(sessions), 설정(user_settings). 돌봄 기록은 아직 올리지 않습니다.
-- 모든 표는 RLS(행 단위 보안)로 "로그인한 본인의 행만" 읽고 쓸 수 있습니다.

-- 고친 시각은 서버 시계로 찍습니다. (기기 시계가 틀려도 "나중에 고친 쪽"을 바르게 가리도록)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1. 할 일 ---------------------------------------------------------------
create table public.tasks (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- 브라우저에서 만든 id 그대로 (crypto.randomUUID)
  id uuid not null,
  title text not null check (char_length(title) between 1 and 100),
  -- 예상 뽀모도로 수
  estimate smallint not null check (estimate between 1 and 20),
  -- 이 할 일로 마친 뽀모도로 수
  completed_pomodoros integer not null default 0 check (completed_pomodoros >= 0),
  done boolean not null default false,
  -- 목록 순서. 작을수록 위 (앱의 order)
  sort_order integer not null,
  created_at timestamptz not null,
  completed_at timestamptz,
  -- "완료한 할 일 정리"로 목록에서 숨긴 시각
  archived_at timestamptz,
  -- 지운 시각. 행을 없애지 않고 표시만 해서 다른 기기가 다시 올리지 않게 함
  deleted_at timestamptz,
  updated_at timestamptz not null default now(),
  -- 같은 브라우저에서 계정을 바꿔 로그인해도 충돌하지 않게 계정까지 묶음
  primary key (user_id, id)
);

-- "마지막으로 받아온 뒤 바뀐 것만" 가져올 때 씀
create index tasks_user_updated_idx on public.tasks (user_id, updated_at);

create trigger tasks_set_updated_at
before insert or update on public.tasks
for each row execute function public.set_updated_at();

alter table public.tasks enable row level security;

create policy "tasks: 본인 것만 읽기" on public.tasks
for select to authenticated using ((select auth.uid()) = user_id);
create policy "tasks: 본인 것만 추가" on public.tasks
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "tasks: 본인 것만 수정" on public.tasks
for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- 삭제 규칙은 두지 않습니다. 지울 때는 deleted_at만 채웁니다. (회원 탈퇴 때는 계정과 함께 지워짐)

-- 2. 집중 기록 -----------------------------------------------------------
create table public.sessions (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  mode text not null check (mode in ('focus', 'short-break', 'long-break')),
  -- 끝난 시각
  ended_at timestamptz not null,
  duration_ms integer not null check (duration_ms > 0),
  -- 그때 선택돼 있던 할 일. 할 일을 지워도 기록은 남아야 해서 외래 키를 걸지 않음
  task_id uuid,
  task_title text check (char_length(task_title) <= 100),
  -- 이 집중으로 한 사이클을 모두 마쳤는지 (수료증)
  cycle_completed boolean not null default false,
  -- 앱이 같은 세션을 가리는 기준(mode + 끝난 시각)과 같음. 두 기기가 같은 기록을 올려도 한 줄
  primary key (user_id, mode, ended_at)
);

-- 캘린더·통계: 기간으로 가져올 때 씀
create index sessions_user_ended_idx on public.sessions (user_id, ended_at);

alter table public.sessions enable row level security;

create policy "sessions: 본인 것만 읽기" on public.sessions
for select to authenticated using ((select auth.uid()) = user_id);
create policy "sessions: 본인 것만 추가" on public.sessions
for insert to authenticated with check ((select auth.uid()) = user_id);
-- 기록은 한번 생기면 고치거나 지우지 않으므로 수정·삭제 규칙은 두지 않습니다.

-- 3. 설정 (사용자마다 한 줄) ---------------------------------------------
create table public.user_settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  -- 기기끼리 맞출 설정만: 집중·휴식 시간, 긴 휴식 주기, 자동 시작, 고른 집중 소리, 수료증에 할 일 표시
  -- (소리 크기, 알림, 화면 효과, 화면 켜두기, 테마, 언어는 브라우저에만 저장)
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  -- 지금 집중할 할 일
  active_task_id uuid,
  updated_at timestamptz not null default now()
);

create trigger user_settings_set_updated_at
before insert or update on public.user_settings
for each row execute function public.set_updated_at();

alter table public.user_settings enable row level security;

create policy "user_settings: 본인 것만 읽기" on public.user_settings
for select to authenticated using ((select auth.uid()) = user_id);
create policy "user_settings: 본인 것만 추가" on public.user_settings
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "user_settings: 본인 것만 수정" on public.user_settings
for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 권한: 로그인한 사람(authenticated)만, 필요한 동작만. 로그인하지 않은 사람(anon)은 접근 불가
revoke all on public.tasks, public.sessions, public.user_settings from anon;
revoke all on public.tasks, public.sessions, public.user_settings from authenticated;
grant select, insert, update on public.tasks to authenticated;
grant select, insert on public.sessions to authenticated;
grant select, insert, update on public.user_settings to authenticated;
