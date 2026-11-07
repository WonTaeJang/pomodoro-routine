# 디자인 시스템: 토큰과 공통 컴포넌트

화면을 만들 때 쓰는 값(색, 간격, 글자 등)과 공통 컴포넌트를 정리한 문서입니다.
**새 화면이나 컴포넌트를 만들 때는 값을 직접 적지 말고 토큰을 씁니다.**

## 디자인 토큰

위치: `src/styles/tokens/` (CSS 변수로 정의, `globals.scss`에서 한 번 불러옴)

| 파일 | 내용 | 예 |
|---|---|---|
| `_color.scss` | 색. 원색 팔레트는 이 파일 안에서만 쓰고, 화면에서는 쓰임별 이름만 씀 | `--color-text`, `--color-accent`, `--color-medal` |
| `_space.scss` | 간격. 4px 단위, `--space-숫자` = 숫자 × 4px | `--space-4` (16px), `--space-1-5` (6px) |
| `_typography.scss` | 글꼴, 글자 크기, 굵기, 줄 높이, 자간 | `--font-size-sm`, `--font-weight-bold` |
| `_shape.scss` | 둥글기, 테두리 두께, 포커스 테두리, 그림자, 비활성 투명도 | `--radius-md`, `--shadow-card` |
| `_motion.scss` | 움직임 시간, 가속도 | `--duration-fast`, `--ease-spring` |
| `_size.scss` | 버튼·입력칸 높이, 화면 폭, 쌓임 순서 | `--control-field`, `--layout-max` |

### 색 토큰

| 묶음 | 토큰 |
|---|---|
| 바탕, 글자, 테두리 | `--color-bg`, `--color-surface`, `--color-surface-hover`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-border-strong`, `--color-focus-ring`, `--color-backdrop` |
| 상태 | `--color-danger`, `--color-danger-hover`, `--color-on-danger` |
| 타이머 모드 | `--color-focus`, `--color-short-break`, `--color-long-break` |
| 강조색 (모드에 따라 바뀜) | `--color-accent`, `-contrast`, `-hover`, `-tint`(화면 배경), `-subtle`(선택된 항목 배경), `-faint`(반투명), `-border`, `-track`(진행 띠 지나간 부분) |
| 기타 | `--color-knob`(흰 손잡이), `--color-medal`, `--color-medal-strong`, `--color-medal-ink`, `--color-medal-tint`, `--color-confetti-1~4` |

- **다크 모드**: `_color.scss`의 `dark` 묶음이 바탕, 글자, 테두리 색을 바꿉니다. 기기 설정을 따르고, `<html data-theme="dark">`로 직접 지정할 수 있습니다.
- **모드별 강조색**: 상위 요소에 `data-mode="short-break"`처럼 지정하면 그 안의 강조색과 강조색에서 만든 색이 모두 모드 색으로 바뀝니다.
  - 강조색에서 만든 색은 `accent()` mixin으로 강조색과 **같은 곳에서 함께** 다시 정합니다. CSS 변수는 정의된 요소에서 값이 계산되기 때문에, 이렇게 해야 모드가 바뀔 때 함께 바뀝니다.

### 토큰 대신 직접 값을 써도 되는 경우
- 한 컴포넌트 안에서만 의미 있는 크기나 효과 값은 파일 위쪽에 Sass 변수로 이름을 붙여 둡니다. (예: 스위치 크기 `$track-width`, 띠 효과 시간 `$breathe-duration`)
- 브레이크포인트는 `_breakpoints.scss`의 Sass 값을 씁니다. (`@include bp.up(md)`)

## 공통 mixin (`src/styles/_mixins.scss`)

| mixin | 용도 |
|---|---|
| `visually-hidden` | 화면에는 안 보이고 화면 낭독기만 읽는 요소 |
| `focus-ring` / `focus-outline` | 키보드 포커스 테두리 |
| `disabled` | 사용할 수 없는 상태 (흐리게, 커서) |
| `reduced-motion` | 기기에서 "움직임 줄이기"를 켰을 때 |

## 공통 컴포넌트 (`src/components/ui/`)

```tsx
import { Badge, Button, Card } from "@/components/ui";
import { PawIcon } from "@/components/icons";
```

| 컴포넌트 | 용도 | 주요 props |
|---|---|---|
| `Card` | 흰 바탕 둥근 카드 (타이머, 할 일 영역) | `as`(div, section, article), `padding`(default, none) |
| `Badge` | 짧은 정보 배지 | `variant`(solid, soft, medal, outline), `size`(sm, md, lg), `icon` |
| `Button` | 글자 버튼 | `variant`(primary, secondary, ghost, danger), `size`(sm, md, lg), `icon`, `fullWidth` |
| `IconButton` | 아이콘만 있는 동그란 버튼 | `label`(필수, 화면 낭독기용), `icon`, `variant`, `size`(sm~xl), `shortcut`(마우스를 올리면 "시작 (Space)") |
| `Dialog` | 팝업 창 | `open`, `onClose`, `title`, `footer`. ESC, 바깥 클릭으로 닫힘. 팝업 위에 팝업을 열면 ESC는 맨 위 것만 닫고, 바깥 팝업의 글자 정렬을 물려받지 않음 |
| `ConfirmDialog` | "정말 할까요?" 확인 팝업 | `open`, `title`, `confirmLabel`, `tone`(primary, danger), `onConfirm`, `onClose` |
| `FieldRow` | 왼쪽 이름·설명, 오른쪽 조작 요소인 한 줄. 좁으면 조작 요소가 다음 줄로 | `label`, `description`, `htmlFor`, `children`(조작 요소) |
| `Switch` | 켜기/끄기 (`FieldRow` 모양) | `checked`, `onCheckedChange`, `label`, `description` |
| `SegmentedControl` | 여러 개 중 하나 선택 (모드 탭) | `label`, `options`, `value`, `onChange`. 방향키로 이동 |
| `TextField` | 라벨 붙은 입력칸 | `label`, `hint`, `error`, `hideLabel` + input 속성 |
| `Checkbox` | 체크박스 | `label` + input 속성 |
| `Slider` | 끌어서 값 고르기 (소리 크기) | `label`, `value`, `onChange`, `min`, `max`, `step`, `format`, `disabled`. 방향키로도 조절 |
| `Stepper` | − 값 + 숫자 조절 | `label`, `value`, `onChange`, `min`, `max`, `format`, `prefix` |
| `ProgressRing` | 원형 진행 띠 | `value`(남은 비율 0~1), `size`, `thickness`, `markers`, `glow`, `flashKey`, `overlay`, `children` |

아이콘(`src/components/icons/`): `Play`, `Pause`, `Reset`, `Skip`, `Settings`, `Plus`, `Minus`, `Check`, `Close`, `Trash`, `Edit`, `Sun`, `Moon`, `Paw`, `Medal` (+`Icon`)
- 모든 아이콘은 `size`(기본 20), `title`을 받고, 색은 글자색을 따릅니다.
- 새 아이콘은 `icons.tsx`에 24×24 격자, 선 두께 2 기준으로 그립니다.

### 기능별 컴포넌트
특정 기능에서만 쓰는 컴포넌트는 `src/features/<기능>/components/`에 둡니다.
- 타이머: `TimerPanel`(카드 조립), `ModeSwitcher`(모드 탭 + 전환 확인), `TimerRing`(진행 띠 + 효과), `KkamiPhoto`, `TimerControls`, `CycleProgress`, `CompletionDialog`, `Celebration`, `TestModeBadge`
- 할 일: `TaskPanel`, `TaskForm`, `TaskItem`, `TaskDoneCheck`, `PawCount`(🐾 완료/예상)
- 기록: `TodaySummary`
- 설정: `SettingsButton`(헤더 버튼 + 창 열기), `SettingsDialog`, 묶음별 `TimerSection`, `AlertSection`, `DisplaySection`, `ShortcutSection`, `DataSection`. 한 줄 모양은 공통 `FieldRow`
  - 설정 되돌리기, 모든 데이터 지우기는 여러 store를 함께 바꾸므로 `src/features/settings/resetData.ts`에 둠
- 알림(`src/features/alerts/`, 화면 없음). 밖에서는 `index.ts`에서 내보낸 것만 씀 (`useAlerts`, `prepareAlerts`, 설정 화면용 `previewAlertSound`, 알림 권한 함수 등)
  - `alerts.ts`: 다음 알림 계산, 알림 문구 (순수 함수)
  - `scheduler.ts`: 예약·취소·중복 방지 규칙. 시간, 소리, 알림을 바깥에서 끼워 넣어(`AlertEnv`) 테스트 가능
  - `sound.ts` / `audio.ts` / `chime.ts` / `sounds.ts`: 브라우저 오디오 통로, 오디오 깨우기, 소리 만들기, 음 정의
  - `notify.ts`: 브라우저 알림과 권한, `prepare.ts`: 시작할 때 오디오 깨우기와 권한 요청, `preview.ts`: 설정의 미리 듣기
  - `useAlerts.ts`: 스케줄러를 타이머와 브라우저 기능에 연결하는 훅
- 수료증(`src/features/certificate/`): 밖에서는 `CertificateLauncher`만 씀 (완료 팝업 버튼, 메달 배지)
  - `certificate.ts`: 최근 사이클 수료증 내용 계산, 시간 표기 (순수 함수, 테스트)
  - `render/layout.ts`: 이미지 크기, 색, 위치(위에서부터 차례로). 디자인을 고칠 때는 주로 여기만 바꿈
  - `render/drawCertificate.ts`: 1080×1920 캔버스에 그리기, `render/canvas.ts`: 글자 쓰기(`drawText`)·둥근 사각형·글자 줄이기·원형 글자·발자국 등 그리기 도우미
  - `share.ts`: 공유 창, 내려받기 / `components/CertificateDialog`: 미리보기, 할 일 보이기, 공유·저장
  - `components/useCertificateImage.ts`: 이미지를 미리 만들어 둠. 내용이 실제로 바뀔 때만 다시 그리고, 다 만들기 전에는 공유·저장을 막고, 쓰지 않는 이미지 주소는 정리
- 마스코트(`src/assets/mascot/`): `kkami-graduate.svg`는 수료증, `kkami-basic.svg`·`kkami-icon.svg`는 로고·파비콘 등에 쓸 예정
- 단축키(`src/features/shortcuts/`, 화면 없음): `shortcuts.ts`에 키 정의(`SHORTCUTS`)와 판별 규칙(`matchShortcut`, 순수 함수). 컴포넌트는 `useShortcuts({ toggle, reset, ... })`로 자기 동작만 연결 (타이머 버튼은 Space·R·N, 설정 버튼은 S). `focusSource.ts`는 포커스가 키보드로 옮겨 왔는지 기록 (Space를 버튼에 맡길지 판단)
- 화면 꺼짐 방지: `src/lib/useWakeLock.ts`의 `useWakeLock(active)`. 메인 화면에서 "진행 중 + 설정 켜짐"일 때 켬
- 타이머 시작은 `startSession()`(`src/features/timer/startSession.ts`)으로 함. 알림 준비 + 시작을 한 번에 하므로 시작 버튼, 완료 팝업, 단축키가 같은 동작을 씀

### 공통으로 뺄지 정하는 기준
- **두 곳 이상**에서 같은 모양으로 쓰이고, 특정 기능(타이머, 할 일)을 몰라도 쓸 수 있으면 `components/ui/`
- 한 기능 안에서만 반복되면 그 기능의 `components/`

## 미리보기

`npm run dev` 실행 후 http://localhost:3000/dev/components 에서 모든 공통 컴포넌트, 아이콘, 다크 모드, 모드별 색을 확인할 수 있습니다. 배포 환경에서는 열리지 않습니다.

## 변경 이력

- 2026-11-07: 작성. 디자인 토큰 도입, Card·Badge 추가, `05-setup.md`의 스타일·컴포넌트 내용을 옮김
- 2026-11-07: Slider, ConfirmDialog, FieldRow, 설정 컴포넌트 추가
- 2026-11-07: 단축키, 화면 꺼짐 방지 구조 추가
- 2026-11-07: 수료증 구조, 마스코트 추가
