# 개발 환경 설정

## 준비물

| 도구 | 버전 | 확인 |
|---|---|---|
| Node.js | **22.12 이상** (Vitest 5 요구 사항) | `node -v` |
| npm | Node.js에 포함 | `npm -v` |

## 처음 받았을 때

```bash
git clone <저장소 주소>
cd pomodoro-routine
npm install
```

## 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 을 열어 "까모도로" 제목이 보이면 성공입니다.

## 로그인 (Supabase) 설정

로그인을 시험하려면 Supabase 프로젝트가 필요합니다. 설정하지 않아도 로그인 메뉴만 숨겨지고 나머지는 그대로 동작합니다.

1. 저장소 맨 위에 `.env.local`을 만들고 Supabase의 프로젝트 주소와 공개 키(publishable)를 넣습니다. 값은 Supabase 대시보드의 Connect 버튼(또는 Project Settings → API Keys)에 있습니다. secret 키는 넣지 않습니다. `.env.local`은 저장소에 올라가지 않습니다.
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<프로젝트>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
2. Supabase **Authentication → URL Configuration**: Site URL `http://localhost:3000`, Redirect URLs에 `http://localhost:3000/**`. 배포하면 실제 주소를 정확한 경로로 추가합니다.
3. Supabase **Authentication → Sign In / Providers → Google**: 구글 클라우드에서 만든 OAuth 클라이언트 ID와 보안 비밀번호를 넣습니다. 구글 쪽 승인된 리디렉션 URI는 Supabase가 보여주는 Callback URL(`https://<프로젝트>.supabase.co/auth/v1/callback`)입니다.
4. `.env.local`을 바꾸면 `npm run dev`를 다시 시작합니다 (값이 빌드할 때 들어감).

## 5초 테스트 모드

`npm run dev` 실행 후 http://localhost:3000/?test=5 로 열면 집중과 휴식이 모두 5초가 됩니다.

- 상단에 "테스트 모드 · 5초" 배지가 보이고, "끄기"를 누르거나 `?test=off`로 열면 꺼집니다.
- 숫자를 바꾸면 다른 초로도 가능합니다. (예: `?test=10`)
- 테스트 중에 완료한 세션도 오늘 기록에 쌓입니다.
- 배포(production) 환경에서는 동작하지 않습니다.

## 테스트 (Vitest)

```bash
npm test           # 파일이 바뀔 때마다 다시 실행 (개발 중)
npm run test:run   # 한 번만 실행
```

- 테스트 파일은 테스트할 코드 옆에 `이름.test.ts`로 둡니다. (예: `src/features/timer/timer.ts` ↔ `timer.test.ts`)

## 코드 포맷 (Prettier)

```bash
npm run format        # 전체 파일 정리
npm run format:check  # 정리 안 된 파일이 있는지 확인만
```

- VS Code / Cursor: 추천 확장 프로그램 **Prettier**, **ESLint**를 설치하면 저장할 때 자동으로 정리됩니다. (`.vscode/settings.json`에 설정되어 있음)
- `docs/`, `package-lock.json`은 정리 대상에서 제외됩니다.

## 스타일과 컴포넌트

디자인 토큰, 공통 mixin, 공통 컴포넌트는 [06-design-system.md](./06-design-system.md)에 정리되어 있습니다.

- 컴포넌트 스타일은 같은 폴더에 `이름.module.scss`로 둡니다.
- 폰트는 **Pretendard** 가변 폰트를 `src/app/layout.tsx`에서 `next/font/local`로 불러옵니다. (`node_modules/pretendard`)

## 이미지 (까미 사진)

| 위치 | 용도 | Git |
|---|---|---|
| `design/kkami/` | **원본 사진**을 넣는 곳. 크기, 형식 상관없음 | 올리지 않음 (`.gitignore`) |
| `src/assets/kkami/` | 화면에 쓰는 **정리된 이미지** | 올림 |
| `public/` | 파비콘, 공유 미리보기 이미지처럼 주소가 고정되어야 하는 파일 | 올림 |
| `docs/images/` | README에 넣는 화면 캡처 (`timer.ko.png`, `timer.en.png` 등) | 올림 |

- 원본은 `design/kkami/`에 넣고, 정리(크기 줄이기, 위치 정보 등 메타데이터 제거, WebP 변환)한 뒤 `src/assets/kkami/`에 둡니다.
  - 저장소가 공개라서 휴대폰 사진의 **촬영 위치(GPS) 정보가 함께 올라가지 않도록** 반드시 메타데이터를 지웁니다.
- 파일 이름은 상황별로 짓습니다.

| 파일 | 쓰는 곳 |
|---|---|
| `kkami-default.webp` | 시작 전 |
| `kkami-focus.webp` | 집중 중 |
| `kkami-short-break.webp` | 짧은 휴식 |
| `kkami-long-break.webp` | 긴 휴식 |
| `kkami-done.webp` | 완료 팝업 |
| `kkami-certificate.webp` | 수료증 이미지의 동그란 사진 (800x800) |

- 정리 기준: 얼굴 중심 정사각형으로 자르기 → 480x480 → WebP(품질 82), 메타데이터 없음
- 수료증 사진은 1080×1920에 크게 그리므로 800x800. 머리부터 리본까지 들어가게 정사각형으로 자름

- 화면에서는 `import`해서 `next/image`로 씁니다. 크기 정보가 자동으로 들어가고, 파일이 바뀌면 캐시도 자동으로 새로 받습니다.

```tsx
import Image from "next/image";
import kkamiFocus from "@/assets/kkami/kkami-focus.webp";

<Image src={kkamiFocus} alt="옆에서 자고 있는 까미" width={120} height={120} />
```

## 코드 구조 원칙

### 돌봄 프로토타입 개발

- `/pet` 실행과 Rive 에셋 제작은 [07-pet-prototype.md](./07-pet-prototype.md)를 참고합니다.
- `npm run dev`와 `npm run build`는 설치된 Rive 런타임의 WASM을 `public/rive/rive.wasm`에 먼저 복사합니다. 이 파일은 생성물이라 Git에서 제외합니다.
- 편집 가능한 RML·제작 설정은 `src/assets/kkami-pet/`, 실행용 `.riv`는 `public/rive/`에서 관리합니다. `design/`의 원본 사진·녹음 제외 규칙은 유지합니다.

### 기능 구성

- 기능별로 `src/features/<기능>/` 아래에 로직, store, 화면을 모읍니다.
  - `timer.ts`처럼 **규칙은 순수 함수**로 두고 현재 시각을 인자로 받습니다. → 테스트에서 시간을 마음대로 넣어 검증
  - `store.ts`는 순수 함수를 불러 상태를 바꾸고 localStorage에 저장합니다.
  - 돌봄 기록은 `PetRepository`를 통해 명시적으로 저장합니다. 실패 재시도·버전 검증·여러 탭의 누적 합산을 처리하며, 기존 앱의 초기 복원·탭 동기화·전체 초기화에 연결합니다. 자세한 계약은 [07-pet-prototype.md](./07-pet-prototype.md)를 따릅니다.
  - `components/`는 store를 읽어 화면을 그립니다.
- 저장된 값은 화면이 뜬 뒤 앱 틀(`AppShell`)이 `useHydrateStores()`로 한 번 불러옵니다. 서버에서 그린 화면과 첫 화면이 달라 생기는 오류(hydration 불일치)를 막기 위함입니다. 각 화면은 `useStoresReady()`로 다 불러왔는지 확인합니다.
- 다른 탭이 저장하면 `useTabSync()`(`src/lib/useTabSync.ts`)가 다시 불러옵니다. 소리와 알림을 낼 탭은 `src/lib/soundTab.ts`에서 정합니다.
- 렌더링 중에 `Date.now()`를 직접 부르지 않고 `useNow()` 시계를 씁니다. 날짜만 필요하면 `useToday()` (날짜가 바뀔 때만 다시 그림).
- localStorage 키는 `src/lib/storage.ts`의 `STORAGE_KEYS`에서 관리: `kkamodoro-timer`(설정, 타이머), `kkamodoro-history`(세션 기록), `kkamodoro-tasks`(할 일), `kkamodoro-pet`(돌봄 기록), `kkamodoro-theme`(테마), `kkamodoro-onboarding`(첫 방문 안내를 봤는지), `kkamodoro-locale`(직접 고른 화면 언어), `kkamodoro-auth`(로그인 정보. Supabase가 읽고 씀), `kkamodoro-sound-tab`(소리를 낼 탭. 데이터 아님)
- 서비스 이름은 화면 문구 사전의 `app.name` ("까모도로" / "Kkamodoro"). 서버가 그리는 첫 탭 제목만 `src/lib/brand.ts`의 `APP_NAME`
- 화면 글자는 코드에 바로 쓰지 않고 `src/i18n/messages/ko.ts`(기준)와 `en.ts`에 넣고 `useTranslations("묶음")`으로 읽음. 화면 밖(알림, 수료증 그림)은 `getTranslator()`. 날짜·시간 표기는 `src/lib/date.ts`에 언어(`useLocale()`)를 넘김

## 폴더 구조

```
pomodoro-routine/
├── CHANGELOG.md           버전별 바뀐 점 (버전 규칙은 docs/commit.md)
├── docs/                  기획 문서
├── src/app/               페이지 (layout.tsx, page.tsx 타이머, calendar/ 캘린더, guide/ 사용법, login/ 로그인, profile/ 내 프로필, auth/callback/ 로그인 뒤 돌아오는 곳)
├── src/app/_components/   모든 페이지의 틀 AppShell (헤더, ☰ 메뉴, 저장값 불러오기, 타이머 동작)
├── src/app/dev/components 컴포넌트 미리보기 (개발 중에만)
├── src/features/timer/    타이머 (로직, store, 화면)
├── src/features/history/  세션 기록, 오늘 기록, 기록 공통 계산(sessions.ts: 날짜별 요약, 할 일 제목)
├── src/features/calendar/ 캘린더 (날짜별 계산, 달력, 날짜 상세)
├── src/features/stats/    통계 (연속 일수, 최근 7일 계산, 캘린더 위 통계 카드)
├── src/features/tasks/    할 일 (로직, store, 화면)
├── src/features/theme/    다크 모드
├── src/features/alerts/   알림 소리, 브라우저 알림
├── src/features/focus-sound/ 집중 소리 (노이즈 만들기, 재생, 헤더 버튼과 펼침 창)
├── src/features/guide/    사용법 페이지, 첫 방문 안내 (글은 content.ko.ts, content.en.ts)
├── src/features/settings/ 설정 창, 데이터 초기화
├── src/features/shortcuts/ 키보드 단축키
├── src/features/auth/     로그인 (Supabase 연결, 로그인 상태, 프로필 계산, 로그인·프로필 화면)
├── src/features/certificate/ 수료증 (내용 계산, 캔버스 그리기, 공유·저장, 팝업)
├── src/i18n/              다국어 (언어 정하기, 화면 문구 사전 messages/, I18nProvider)
├── src/components/layout/ 헤더, 페이지 메뉴, 페이지 본문 틀
├── src/components/ui/     공통 컴포넌트
├── src/components/icons/  아이콘
├── src/styles/            토큰(tokens/), mixin, 브레이크포인트, 전체 기본 스타일
├── src/lib/               공통 함수, 훅 (cx, date, random, audio, useNow·useToday, useHydrateStores·useStoresReady, useWakeLock)
├── src/assets/kkami/      까미 이미지 (정리된 것)
├── src/assets/mascot/     까미 마스코트 SVG (basic, graduate, icon)
├── design/                원본 사진, 원본 녹음(sound/) 등 (Git에 올리지 않음)
├── public/                파비콘 등 주소가 고정된 파일
├── public/sounds/         다듬은 집중 소리 녹음 (scripts/focus-sounds.mjs로 만듦)
├── scripts/               개발용 스크립트 (focus-sounds.mjs: 녹음 다듬기, ffmpeg 필요)
├── AGENTS.md              AI 코딩 도우미용 Next.js 안내
└── package.json
```

## 변경 이력

- 2026-11-10: 돌봄 저장 키와 명시적 저장 계층, 앱 복원·동기화 연결 안내 추가.

- 2026-11-10: 돌봄 기능·Rive 에셋 및 WASM 준비 절차 추가 (I-020).

- 2026-11-07: 작성 (create-next-app 16.4.5 기준)
- 2026-11-07: 패키지 매니저를 pnpm에서 npm으로 변경
- 2026-11-07: Prettier 사용법 추가
- 2026-11-07: Tailwind 제거, SCSS 스타일 구조 추가. 프로젝트 생성 명령은 이미 끝난 작업이라 "처음 받았을 때"로 교체
- 2026-11-07: 폰트, 공통 컴포넌트, 미리보기 페이지 안내 추가
- 2026-11-07: Node 최소 버전 22.12로 변경, 테스트 명령 추가
- 2026-11-07: 코드 구조 원칙, 기능 폴더 추가
- 2026-11-07: 까미 이미지 폴더와 규칙 추가
- 2026-11-07: 까미 이미지 파일 목록, 5초 테스트 모드 사용법 추가
- 2026-11-07: 할 일, 테마 폴더와 Stepper 컴포넌트 추가
- 2026-11-07: ProgressRing 컴포넌트 추가
- 2026-11-07: 스타일·컴포넌트 내용을 06-design-system.md로 옮김
- 2026-11-07: alerts 폴더 추가
- 2026-11-07: settings 폴더 추가
- 2026-11-07: shortcuts 폴더 추가
- 2026-11-07: certificate 폴더, 마스코트 SVG 추가
- 2026-11-08: calendar 폴더, 캘린더 페이지, 앱 틀(AppShell) 추가
- 2026-11-08: focus-sound 폴더, scripts/, public/sounds/ 추가
- 2026-11-08: stats 폴더 추가
- 2026-11-08: 다른 탭과 맞추기(`useTabSync`), `kkamodoro-sound-tab` 추가
- 2026-11-08: guide 폴더, `/guide` 페이지, 헤더 메뉴(HeaderMenu) 추가
- 2026-11-08: CHANGELOG.md, package.json `repository` 추가
- 2026-11-08: 사용법 페이지 내용, `content.ko.ts`
- 2026-11-08: 첫 방문 안내, `kkamodoro-onboarding` 추가
- 2026-11-08: 다국어 `src/i18n/`, `kkamodoro-locale`, 화면 글자 쓰는 법 추가
- 2026-11-08: README 화면 캡처 위치 `docs/images/` 추가
- 2026-11-10: 로그인 (Supabase) 설정(`.env.local`), `kkamodoro-auth`, `src/features/auth/` 추가
