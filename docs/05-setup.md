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

## 폴더 구조

```
pomodoro-routine/
├── docs/          기획 문서
├── public/        이미지 등 정적 파일 (까미 이미지는 여기)
├── src/app/       페이지 (layout.tsx, page.tsx)
├── src/styles/    공통 스타일
├── AGENTS.md      AI 코딩 도우미용 Next.js 안내
└── package.json
```

## 변경 이력

- 2026-11-07: 작성 (create-next-app 16.4.5 기준)
- 2026-11-07: 패키지 매니저를 pnpm에서 npm으로 변경
- 2026-11-07: Prettier 사용법 추가
- 2026-11-07: Tailwind 제거, SCSS 스타일 구조 추가. 프로젝트 생성 명령은 이미 끝난 작업이라 "처음 받았을 때"로 교체
