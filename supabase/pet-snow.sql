-- 까모도로: 눈송이 상자 (백로그 I-074)
-- Supabase 대시보드 > SQL Editor에 통째로 붙여 넣고 한 번 실행합니다.
-- pet-game.sql, admin.sql, pet-gift.sql을 실행한 다음에 실행하세요. 여러 번 실행해도 결과가 같습니다.
-- 하는 일
--   돌봄 기록(pet_game_history)에 'snow'(그날 눈송이 상자를 엶) 종류를 받게 함.
--   눈송이 상자는 누구나 받으므로 올리는 규칙은 그대로입니다(VIP 확인은 'gift'에만).
-- 참고: 11~2월에만 상자가 오는지, 하루 한 번인지는 앱이 검사합니다.

-- 돌봄 기록 종류에 'snow' 추가 ---------------------------------------------
-- pet-gift.sql이 만든 종류 검사(또는 pet-game.sql의 처음 검사)를 찾아 바꿉니다.
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
  or (kind in ('pats', 'snacks', 'seen', 'gift', 'snow') and item is null and furniture is null and slot is null)
);
