-- 까모도로: 까미 돌봄 기록을 로그인 계정에 저장하는 표 (백로그 I-064)
-- Supabase 대시보드 > SQL Editor에 통째로 붙여 넣고 한 번 실행합니다. (sync-tables.sql 다음에)
-- 표 2개
--   pet_game: 계정마다 한 줄. 까미 기록 전체를 정리해 둔 것
--   pet_game_history: 돌봄 기록. 쓰담·간식·산책·만들기·놓기를 한 줄씩 쌓기만 함
-- 까미의 지금 모습 = pet_game에 정리한 기록 + 그 뒤에 쌓인 돌봄 기록을 서버에 들어온 순서대로 적용한 것.
-- 두 기기에서 따로 돌봐도 돌봄 기록이 모두 남아 합쳐집니다.
-- 앱은 다마고치 화면에 들어올 때마다 돌봄 기록을 pet_game에 정리합니다.
-- 정리가 끝나고 하루가 지난 돌봄 기록은 서버가 매일 한 번 지웁니다. (3번, pg_cron)
-- RLS(행 단위 보안)로 "로그인한 본인의 행만" 읽고 쓸 수 있고, 회원 탈퇴하면 계정과 함께 지워집니다.

-- 1. 정리한 까미 기록 (계정마다 한 줄) ------------------------------------

create table public.pet_game (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  -- 까미 기록 전체 (친밀도·산책·아이템·가구·꾸민 방·옷·하루 횟수).
  -- 브라우저 저장소(kkamodoro-pet)의 state.pet과 같은 모양이고, 앱이 읽을 때 검사합니다.
  pet jsonb not null check (jsonb_typeof(pet) = 'object' and octet_length(pet::text) <= 65536),
  -- 저장 형식 버전 (src/features/pet/repository.ts의 VERSION).
  -- 앱보다 새 버전이 저장돼 있으면 앱은 읽기만 하고 덮어쓰지 않습니다.
  version smallint not null check (version >= 1),
  -- 이 정리에 넣은 마지막 돌봄 기록의 created_at. 이보다 뒤에 들어온 돌봄 기록을 위에 적용합니다.
  -- 아직 돌봄 기록을 넣지 않았으면 null
  history_until timestamptz,
  updated_at timestamptz not null default now()
);

-- 고친 시각은 서버 시계로 (sync-tables.sql의 set_updated_at 함수를 함께 씀)
create trigger pet_game_set_updated_at
before insert or update on public.pet_game
for each row execute function public.set_updated_at();

alter table public.pet_game enable row level security;

create policy "pet_game: 본인 것만 읽기" on public.pet_game
for select to authenticated using ((select auth.uid()) = user_id);
create policy "pet_game: 본인 것만 추가" on public.pet_game
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "pet_game: 본인 것만 수정" on public.pet_game
for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- 삭제 규칙은 두지 않습니다. (회원 탈퇴 때는 계정과 함께 지워짐)

-- 2. 돌봄 기록 (쌓기만 함) -----------------------------------------------
create table public.pet_game_history (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- 브라우저에서 만든 id (crypto.randomUUID). 같은 기록을 두 번 올려도 한 줄만 남음
  id uuid not null,
  -- 어느 까미의 기록인지 (pet_game.pet의 id). 다른 까미의 기록을 섞지 않게
  pet_id text not null check (char_length(pet_id) between 1 and 128),
  -- pats 쓰담, snacks 간식, walks 산책(주운 아이템), seen 아이템 상자 열기,
  -- craft 만들기, place 꾸미기에서 놓기
  kind text not null check (kind in ('pats', 'snacks', 'walks', 'seen', 'craft', 'place')),
  -- 돌본 날 (기기의 로컬 날짜). 하루 쓰담 보너스·산책·간식 횟수를 이 날짜로 셈
  day date not null,
  -- 돌본 시각 (기기 시계). 까미 기록에 남기는 값이고, 적용 순서는 created_at·seq를 따름
  at timestamptz not null,
  -- 같은 날 연달아 한 횟수 (seen은 상자를 열 때까지 찾은 아이템 수)
  count integer not null check (count >= 0 and count <= 100000),
  -- walks: 주운 아이템, craft·place: 가구(place에서 null이면 기본 모양으로 되돌림), place: 자리
  item text check (char_length(item) <= 32),
  furniture text check (char_length(furniture) <= 32),
  slot text check (char_length(slot) <= 32),
  -- 서버에 들어온 시각 (서버 시계). 적용 순서이자 "그 뒤로 새로 들어온 것"만 받을 때 쓰는 기준.
  -- now()는 한 번에 여러 줄을 올리면 모두 같은 시각이 되므로, 줄마다 실제 시각을 찍는 clock_timestamp()를 씀
  created_at timestamptz not null default clock_timestamp(),
  -- 서버에 들어온 순번. created_at이 같을 때 순서를 정함
  seq bigint generated always as identity,
  primary key (user_id, id),
  check (
    (kind = 'walks' and item is not null and furniture is null and slot is null)
    or (kind = 'craft' and furniture is not null and item is null and slot is null)
    or (kind = 'place' and slot is not null and item is null)
    or (kind in ('pats', 'snacks', 'seen') and item is null and furniture is null and slot is null)
    -- 'gift'(VIP 선물 상자)는 pet-gift.sql이 더합니다 (admin.sql의 vip_users가 필요해서 따로)
  )
);

-- "정리한 뒤 들어온 것만" 순서대로 가져올 때, 그리고 3번의 지우기에서 씀
create index pet_game_history_user_created_idx
on public.pet_game_history (user_id, created_at, seq);

alter table public.pet_game_history enable row level security;

create policy "pet_game_history: 본인 것만 읽기" on public.pet_game_history
for select to authenticated using ((select auth.uid()) = user_id);
create policy "pet_game_history: 본인 것만 추가" on public.pet_game_history
for insert to authenticated with check ((select auth.uid()) = user_id);
-- 앱에서는 고치거나 지우지 않으므로 수정·삭제 규칙은 두지 않습니다. (지우기는 3번의 서버 작업이 함)

-- 권한: 로그인한 사람(authenticated)만, 필요한 동작만. 로그인하지 않은 사람(anon)은 접근 불가
revoke all on public.pet_game, public.pet_game_history from anon;
revoke all on public.pet_game, public.pet_game_history from authenticated;
grant select, insert, update on public.pet_game to authenticated;
grant select, insert on public.pet_game_history to authenticated;

-- 3. 정리된 돌봄 기록 지우기 (매일 한 번) ------------------------------------
-- pg_cron: Supabase에 들어 있는 예약 작업 기능. 대시보드 > Integrations > Cron에서 켠 것과 같습니다.
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- 매일 18:17 UTC(한국 03:17)에, pet_game에 이미 정리됐고(created_at <= history_until)
-- 서버에 들어온 지 하루가 지난 돌봄 기록을 지웁니다.
-- 같은 이름으로 다시 실행하면 작업이 새로 생기지 않고 바뀝니다.
select cron.schedule(
  'pet-game-history-cleanup',
  '17 18 * * *',
  $$
  delete from public.pet_game_history h
  using public.pet_game g
  where h.user_id = g.user_id
    and g.history_until is not null
    and h.created_at <= g.history_until
    and h.created_at < now() - interval '1 day'
  $$
);
