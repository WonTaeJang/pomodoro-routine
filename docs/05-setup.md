# 개발 환경 설정

## 준비물

| 도구 | 버전 | 확인 |
|---|---|---|
| Node.js | **20.9 이상** (LTS 권장) | `node -v` |
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

아이콘: `PlayIcon`, `PauseIcon`, `ResetIcon`, `SkipIcon`, `SettingsIcon`, `PlusIcon`, `CheckIcon`, `CloseIcon`, `TrashIcon`, `EditIcon`, `SunIcon`, `MoonIcon`, `PawIcon`

- 모든 아이콘은 `size`(기본 20), `title` props를 받습니다. 색은 글자색을 따릅니다.
- 새 아이콘은 `src/components/icons/icons.tsx`에 24x24 격자, 선 두께 2 기준으로 추가합니다.

### 강조색과 모드

버튼, 스위치, 선택된 탭 등은 `--color-accent`를 씁니다. 상위 요소에 `data-mode`를 주면 강조색이 모드 색으로 바뀝니다.

```tsx
<main data-mode="short-break">...</main> // 초록
```

### 미리보기

`npm run dev` 실행 후 http://localhost:3000/dev/components 에서 모든 컴포넌트와 아이콘, 다크 모드를 확인할 수 있습니다. 이 페이지는 배포(production) 환경에서는 열리지 않습니다.

## 폴더 구조

```
pomodoro-routine/
├── docs/          기획 문서
├── public/        이미지 등 정적 파일 (까미 이미지는 여기)
├── src/app/               페이지 (layout.tsx, page.tsx)
├── src/app/dev/components 컴포넌트 미리보기 (개발 중에만)
├── src/components/ui/     공통 컴포넌트
├── src/components/icons/  아이콘
├── src/lib/               공통 함수 (cx 등)
├── src/styles/            공통 스타일
├── AGENTS.md      AI 코딩 도우미용 Next.js 안내
└── package.json
```

## 변경 이력

- 2026-11-07: 작성 (create-next-app 16.4.5 기준)
- 2026-11-07: 패키지 매니저를 pnpm에서 npm으로 변경
- 2026-11-07: Prettier 사용법 추가
- 2026-11-07: Tailwind 제거, SCSS 스타일 구조 추가. 프로젝트 생성 명령은 이미 끝난 작업이라 "처음 받았을 때"로 교체
- 2026-11-07: 폰트, 공통 컴포넌트, 미리보기 페이지 안내 추가
