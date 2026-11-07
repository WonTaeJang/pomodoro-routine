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

브라우저에서 http://localhost:3000 을 열어 "까미도로" 제목이 보이면 성공입니다.

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

## 스타일 구조 (SCSS)

```
src/styles/
├── globals.scss       전체 기본 스타일, 색상 변수(--color-*), 다크 모드
├── _breakpoints.scss  화면 너비 기준점과 @include up(md) mixin
└── _mixins.scss       visually-hidden, focus-ring 등 공통 mixin
```

- 컴포넌트 스타일은 같은 폴더에 `이름.module.scss`로 둡니다. (예: `page.tsx` ↔ `page.module.scss`)
- 공통 파일은 `@use`로 가져옵니다.

```scss
@use "../styles/breakpoints" as bp;

.title {
  font-size: 2.5rem;

  @include bp.up(md) {
    font-size: 3.5rem;
  }
}
```

- 색상은 SCSS 변수가 아니라 CSS 변수로 씁니다: `color: var(--color-focus);`
- 다크 모드는 시스템 설정을 따르고, `<html data-theme="dark">`처럼 직접 지정할 수도 있습니다.

## 폰트

- **Pretendard** 가변 폰트를 `src/app/layout.tsx`에서 `next/font/local`로 불러옵니다. 파일은 `node_modules/pretendard`에 있어 따로 받을 필요가 없습니다.
- CSS에서는 `var(--font-sans)`로 씁니다. (`globals.scss`에서 body에 적용됨)

## 공통 컴포넌트

```tsx
import { Button, IconButton, Dialog } from "@/components/ui";
import { PlayIcon, SettingsIcon } from "@/components/icons";
```

| 컴포넌트 | 용도 | 주요 props |
|---|---|---|
| `Button` | 글자 버튼 | `variant`(primary, secondary, ghost, danger), `size`(sm, md, lg), `icon`, `fullWidth` |
| `IconButton` | 아이콘만 있는 동그란 버튼 | `label`(필수, 화면 낭독기용), `icon`, `variant`, `size`(sm~xl) |
| `Dialog` | 팝업 창 (설정, 완료 알림) | `open`, `onClose`, `title`, `footer`. ESC, 바깥 클릭으로 닫힘 |
| `Switch` | 켜기/끄기 | `checked`, `onCheckedChange`, `label`, `description` |
| `SegmentedControl` | 여러 개 중 하나 선택 (모드 탭) | `label`, `options`, `value`, `onChange`. 방향키로 이동 |
| `TextField` | 라벨 붙은 입력칸 | `label`, `hint`, `error`, `hideLabel` + input 속성 |
| `Checkbox` | 체크박스 (할 일 완료) | `label` + input 속성 |
| `ProgressRing` | 원형 진행 띠 (까미 사진 둘레) | `value`(남은 비율 0~1), `size`, `thickness`, `markers`(띠 위 표시), `glow`, `flashKey`(바뀔 때 반짝), `overlay`, `children` |
| `Stepper` | − 값 + 숫자 조절 (예상 개수, 설정 시간) | `label`, `value`, `onChange`, `min`, `max`, `format`, `prefix` |

아이콘: `PlayIcon`, `PauseIcon`, `ResetIcon`, `SkipIcon`, `SettingsIcon`, `PlusIcon`, `MinusIcon`, `CheckIcon`, `CloseIcon`, `TrashIcon`, `EditIcon`, `SunIcon`, `MoonIcon`, `PawIcon`

- 모든 아이콘은 `size`(기본 20), `title` props를 받습니다. 색은 글자색을 따릅니다.
- 새 아이콘은 `src/components/icons/icons.tsx`에 24x24 격자, 선 두께 2 기준으로 추가합니다.

### 강조색과 모드

버튼, 스위치, 선택된 탭 등은 `--color-accent`를 씁니다. 상위 요소에 `data-mode`를 주면 강조색이 모드 색으로 바뀝니다.

```tsx
<main data-mode="short-break">...</main> // 초록
```

### 미리보기

`npm run dev` 실행 후 http://localhost:3000/dev/components 에서 모든 컴포넌트와 아이콘, 다크 모드를 확인할 수 있습니다. 이 페이지는 배포(production) 환경에서는 열리지 않습니다.

## 이미지 (까미 사진)

| 위치 | 용도 | Git |
|---|---|---|
| `design/kkami/` | **원본 사진**을 넣는 곳. 크기, 형식 상관없음 | 올리지 않음 (`.gitignore`) |
| `src/assets/kkami/` | 화면에 쓰는 **정리된 이미지** | 올림 |
| `public/` | 파비콘, 공유 미리보기 이미지처럼 주소가 고정되어야 하는 파일 | 올림 |

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

- 정리 기준: 얼굴 중심 정사각형으로 자르기 → 480x480 → WebP(품질 82), 메타데이터 없음

- 화면에서는 `import`해서 `next/image`로 씁니다. 크기 정보가 자동으로 들어가고, 파일이 바뀌면 캐시도 자동으로 새로 받습니다.

```tsx
import Image from "next/image";
import kkamiFocus from "@/assets/kkami/kkami-focus.webp";

<Image src={kkamiFocus} alt="옆에서 자고 있는 까미" width={120} height={120} />
```

## 코드 구조 원칙

- 기능별로 `src/features/<기능>/` 아래에 로직, store, 화면을 모읍니다.
  - `timer.ts`처럼 **규칙은 순수 함수**로 두고 현재 시각을 인자로 받습니다. → 테스트에서 시간을 마음대로 넣어 검증
  - `store.ts`는 순수 함수를 불러 상태를 바꾸고 localStorage에 저장합니다.
  - `components/`는 store를 읽어 화면을 그립니다.
- 저장된 값은 화면이 뜬 뒤 `useHydrateStores()`로 불러옵니다. 서버에서 그린 화면과 첫 화면이 달라 생기는 오류(hydration 불일치)를 막기 위함입니다.
- 렌더링 중에 `Date.now()`를 직접 부르지 않고 `useNow()` 시계를 씁니다.
- localStorage 키: `kkamidoro-timer`(설정, 타이머), `kkamidoro-history`(세션 기록), `kkamidoro-tasks`(할 일), `kkamidoro-theme`(테마)

## 폴더 구조

```
pomodoro-routine/
├── docs/                  기획 문서
├── src/app/               페이지 (layout.tsx, page.tsx)
├── src/app/dev/components 컴포넌트 미리보기 (개발 중에만)
├── src/features/timer/    타이머 (로직, store, 화면)
├── src/features/history/  세션 기록, 오늘 기록
├── src/features/tasks/    할 일 (로직, store, 화면)
├── src/features/theme/    다크 모드
├── src/components/layout/ 헤더 등 화면 틀
├── src/components/ui/     공통 컴포넌트
├── src/components/icons/  아이콘
├── src/styles/            공통 스타일
├── src/lib/               공통 함수, 훅 (cx, useNow, useHydrateStores)
├── src/assets/kkami/      까미 이미지 (정리된 것)
├── design/                원본 사진 등 (Git에 올리지 않음)
├── public/                파비콘 등 주소가 고정된 파일
├── AGENTS.md              AI 코딩 도우미용 Next.js 안내
└── package.json
```

## 변경 이력

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
