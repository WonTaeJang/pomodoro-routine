-- 까모도로: 회원 탈퇴 (백로그 I-043)
-- Supabase 대시보드 > SQL Editor에 붙여 넣고 한 번 실행합니다. (sync-tables.sql 다음에)
--
-- 계정(auth.users)은 브라우저의 공개 키로 지울 수 없어서, 관리자 권한으로 실행되지만
-- "지금 로그인한 본인(auth.uid())의 계정만" 지우는 함수를 둡니다. 지울 id는 브라우저가 보내는 값이 아니라
-- 서버가 로그인 토큰에서 꺼낸 값이라 남의 계정은 지울 수 없습니다.
-- 계정이 지워지면 tasks·sessions·user_settings의 본인 행도 on delete cascade로 함께 지워집니다.
-- 브라우저에서는 supabase.rpc("delete_my_account")로 부릅니다.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

-- 로그인한 사람만 부를 수 있게
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
