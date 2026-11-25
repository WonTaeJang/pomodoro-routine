-- 까모도로: VIP 선물 상자 (백로그 I-070)
-- Supabase 대시보드 > SQL Editor에 통째로 붙여 넣고 한 번 실행합니다.
-- pet-game.sql과 admin.sql을 실행한 다음에 실행하세요. 여러 번 실행해도 결과가 같습니다.
-- 하는 일
--   1. 돌봄 기록(pet_game_history)에 'gift'(그날 VIP 선물 상자를 엶) 종류를 받게 함
--   2. 'gift' 기록은 VIP 계정(vip_users)만 올릴 수 있게 함
-- 참고: 정리한 까미 기록(pet_game.pet)은 지금처럼 앱이 검사합니다. 2는 VIP가 아닌 계정이
-- 선물 기록을 쌓지 못하게 막는 가벼운 서버 규칙입니다.

-- 1. 돌봄 기록 종류에 'gift' 추가 -------------------------------------------
-- pet-game.sql이 만든 이름 없는 종류 검사를 찾아 바꿉니다.
do $$
declare
  old_check text;
begin
  for old_check in
    select conname from pg_constraint
    where conrelid = 'public.pet_game_history'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%kind%walks%'
  loop
    execute format('alter table public.pet_game_history drop constraint %I', old_check);
  end loop;
end $$;

alter table public.pet_game_history
add constraint pet_game_history_kind_check check (
  (kind = 'walks' and item is not null and furniture is null and slot is null)
  or (kind = 'craft' and furniture is not null and item is null and slot is null)
  or (kind = 'place' and slot is not null and item is null)
  -- 'snow'는 pet-snow.sql의 눈송이 상자. 이 파일을 다시 실행해도 빠지지 않게 함께 둡니다
  or (kind in ('pats', 'snacks', 'seen', 'gift', 'snow') and item is null and furniture is null and slot is null)
);

-- 2. 'gift' 기록은 VIP만 올림 ----------------------------------------------
-- 본인 행만 올리는 규칙에 "선물이면 VIP일 것"을 더합니다. (vip_users는 본인 행만 읽을 수 있어 이 확인에 충분)
drop policy if exists "pet_game_history: 본인 것만 추가" on public.pet_game_history;
create policy "pet_game_history: 본인 것만 추가" on public.pet_game_history
for insert to authenticated with check (
  (select auth.uid()) = user_id
  and (
    kind <> 'gift'
    or exists (select 1 from public.vip_users v where v.user_id = (select auth.uid()))
  )
);
