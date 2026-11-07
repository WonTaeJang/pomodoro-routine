# 개발 환경 설정

## 준비물

| 도구 | 버전 | 확인 |
|---|---|---|
| Node.js | **20.9 이상** (LTS 권장) | `node -v` |
| npm | Node.js에 포함 | `npm -v` |

## Next.js 프로젝트 생성 (최초 1회)

프로젝트 폴더(`pomodoro-routine`) 안에서 실행합니다. `.git`, `docs/`가 이미 있어도 그대로 생성됩니다.

```bash
cd ~/Desktop/Workspace/pomodoro-routine

npx create-next-app@latest . --yes \
  --typescript --eslint --tailwind --app --src-dir \
  --import-alias "@/*" \
  --no-react-compiler --agents-md --no-agent-feedback \
  --use-npm
```

| 옵션 | 의미 |
|---|---|
| `.` | 지금 폴더에 생성 |
| `--yes` | 질문 없이 아래 옵션대로 진행 |
| `--typescript` | TypeScript 사용 |
| `--eslint` | 코드 검사 도구 ESLint |
| `--tailwind` | Tailwind CSS |
| `--app` | App Router |
| `--src-dir` | 코드를 `src/` 안에 둠 |
| `--import-alias "@/*"` | `@/components/...` 형태로 import |
| `--no-react-compiler` | React Compiler는 지금은 사용 안 함 |
| `--agents-md` | AI 코딩 도우미용 Next.js 안내 파일(`AGENTS.md`) 생성 |
| `--no-agent-feedback` | Next.js 팀으로 피드백 보내는 기능 끔 |
| `--use-npm` | npm으로 패키지 설치 |

## 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 을 열어 Next.js 기본 화면이 보이면 성공입니다.

## 생성 후 폴더 구조 (예상)

```
pomodoro-routine/
├── docs/               기획 문서
├── public/             이미지 등 정적 파일 (까미 이미지는 여기)
├── src/app/            페이지 (layout.tsx, page.tsx, globals.css)
├── AGENTS.md
├── package.json
└── ...
```

## 변경 이력

- 2026-11-07: 작성 (create-next-app 16.4.5 기준)
- 2026-11-07: 패키지 매니저를 pnpm에서 npm으로 변경
