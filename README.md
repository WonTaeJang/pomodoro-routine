**한국어** | [English](./README.en.md)

# 까모도로 (Kkamodoro)

까만 푸들 **까미**와 함께하는 뽀모도로 타이머예요.
25분 집중하고 5분 쉬는 걸 반복하고, 집중을 4번 마치면 까미 수료증을 받아요.

> **https://kkamodoro.vercel.app** 에서 바로 쓸 수 있어요. 내 컴퓨터에서 실행하려면 [실행하기](#실행하기)를 봐 주세요.

<!--
화면 미리보기: 이미지를 docs/images/에 넣고 아래 주석을 풀면 됩니다.
<p>
  <img src="./docs/images/timer.ko.png" alt="타이머 화면" width="640" />
  <img src="./docs/images/calendar.ko.png" alt="캘린더와 통계" width="640" />
  <img src="./docs/images/certificate.ko.png" alt="까미 수료증" width="240" />
</p>
-->

## 주요 기능

- **타이머**: 집중 · 짧은 휴식 · 긴 휴식. 시간과 긴 휴식 주기는 설정에서 바꿀 수 있어요. 자동 시작(5초 뒤 시작, 사이클을 마치면 멈춤), 남은 시간을 보여주는 진행 띠와 발자국 도장, 브라우저 탭 제목에 남은 시간을 보여줘요.
- **할 일**: 할 일마다 집중 몇 번이면 끝날지 예상 🐾를 정하고, 집중을 마칠 때마다 🐾가 쌓여요. 끌어서 순서 바꾸기(마우스 · 터치 · 키보드), 완료한 할 일 정리를 할 수 있어요.
- **집중 소리**: 노이즈 3가지(백색 · 핑크 · 브라운), 자연의 소리 5가지(빗소리, 창가 빗소리, 모닥불, 숲속, 파도), 공간의 소리(비행기 기내). 집중하는 동안에만 들리고, "랜덤"을 고르면 집중마다 다른 소리가 나와요.
- **캘린더와 통계**: 날짜별 집중 횟수 · 시간 · 한 일, 연속 일수, 최근 7일, 이번 달, 전체 기록.
- **까미 수료증**: 사이클을 마치면 그날의 수료증을 이미지(1080×1920, 인스타그램 스토리 크기)로 저장하거나 공유해요.
- **알림**: 세션이 끝나면 알림 소리, 다른 탭을 보고 있으면 브라우저 알림.
- **로그인 (선택)**: 구글이나 카카오 계정으로 로그인하면 할 일, 기록, 설정이 계정에 저장돼서 다른 기기에서도 이어 쓸 수 있어요. 프로필에서 닉네임을 바꾸거나 회원 탈퇴할 수 있어요. 로그인하지 않아도 모든 기능을 그대로 쓸 수 있어요.
- **단축키**: `Space` 시작 / 일시정지, `R` 리셋, `N` 다음 세션, `S` 설정.
- **그 밖에**: 다크 모드, 한국어 / English, 첫 방문 안내와 사용법 페이지(`/guide`), 타이머가 도는 동안 화면 켜두기, 탭을 여러 개 열어도 같은 타이머.

### 기록은 어디에 저장되나요?

- **로그인하지 않으면:** 할 일, 기록, 설정은 **지금 쓰는 브라우저(localStorage)에만** 저장돼요. 서버로 보내지 않고, 브라우저 데이터를 지우면 기록도 함께 사라져요.
- **로그인하면:** 할 일, 집중 기록, 설정(시간, 자동 시작, 집중 소리 등)이 계정(Supabase)에도 저장돼서 다른 기기에서 같은 계정으로 이어 쓸 수 있어요. 로그인 전에 이 브라우저에 쌓인 할 일과 기록은 로그인할 때 계정에 합쳐져요. 소리 크기, 알림, 화면 설정, 테마, 언어는 브라우저에만 저장돼요.
- **로그아웃하면** 이 브라우저의 할 일, 기록, 타이머가 지워져요(계정에는 남아 있어요). **회원 탈퇴하면** 계정과 계정에 저장된 데이터가 모두 지워져요.

## 실행하기

[Node.js](https://nodejs.org) **22.12 이상**이 필요해요.

```bash
git clone https://github.com/WonTaeJang/pomodoro-routine.git
cd pomodoro-routine
npm install
npm run dev
```

브라우저에서 http://localhost:3000 을 열어요.

| 명령                         | 하는 일                   |
| ---------------------------- | ------------------------- |
| `npm run dev`                | 개발 서버                 |
| `npm run build`, `npm start` | 배포용으로 만들고 실행    |
| `npm run test:run`           | 테스트 (Vitest)           |
| `npm run lint`               | 코드 검사 (ESLint)        |
| `npm run format:check`       | 코드 모양 확인 (Prettier) |

개발 중에는 주소 뒤에 `?test=5`를 붙이면 모든 세션이 5초가 돼요 (`?test=off`로 끔). 자세한 내용은 [개발 환경 설정](./docs/05-setup.md)을 봐 주세요.

로그인을 시험하려면 Supabase 프로젝트를 만들고 `.env.local`에 주소와 공개 키를 넣어야 해요. 넣지 않으면 로그인 메뉴만 숨겨지고 나머지는 그대로 동작해요. 계정에 저장하려면 `supabase/`의 SQL 두 개도 실행해야 해요. ([로그인 설정](./docs/05-setup.md#로그인-supabase-설정))

## 기술 스택

| 분야       | 사용한 것                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------- |
| 프레임워크 | Next.js 16 (App Router), React 19, TypeScript                                               |
| 스타일     | SCSS Modules + 디자인 토큰, [Pretendard](https://github.com/orioncactus/pretendard) 글꼴    |
| 상태       | Zustand (localStorage에 저장, 탭끼리 맞추기)                                                |
| 로그인     | Supabase Auth (구글 · 카카오)                                                               |
| 다국어     | use-intl (한국어 · 영어)                                                                    |
| 그 밖에    | dnd-kit (끌어서 순서 바꾸기), Web Audio API (알림 소리 · 집중 소리), Canvas (수료증 이미지) |
| 테스트     | Vitest                                                                                      |

## 문서

- [문서 목록](./docs/README.md): 기획, 결정 기록, 개발 환경, 디자인 시스템
- [바뀐 점 (CHANGELOG)](./CHANGELOG.md)
- [버그 · 개선 백로그](./docs/backlog.md)
- [커밋 · 버전 규칙](./docs/commit.md)

문서는 한국어로 쓰여 있어요.

## 출처

- 자연의 소리 녹음: [Pixabay](https://pixabay.com) ([Pixabay Content License](https://pixabay.com/service/terms/)). 소리별 원본은 [결정 기록의 "집중 소리"](./docs/03-decisions.md#집중-소리-2026-11-08)에 있어요.

## 라이선스

코드는 [MIT 라이선스](./LICENSE)예요. 아래는 MIT 라이선스에 들어가지 않아요.

- **까미 사진**(`src/assets/kkami/`, 링크 미리보기 이미지 `src/app/opengraph-image.png`), **마스코트 그림**(`src/assets/mascot/`)과 **도트 까미 그림**(`public/rive/*.riv`, `src/assets/kkami-pet/`, `src/assets/kkami-walk/`), 이것이 들어간 화면 캡처(`docs/images/`): 허락 없이 쓰거나 고치거나 배포할 수 없어요.
- **집중 소리 녹음**(`public/sounds/`): Pixabay 녹음을 다듬은 것이라 [Pixabay Content License](https://pixabay.com/service/terms/)를 따라요. 파일만 따로 배포할 수 없어요.
