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
- 브레이크포인트는 `_breakpoints.scss`의 Sass 값을 씁니다: `xs` 360px(아주 좁은 휴대폰), `sm` 480px, `md` 768px, `lg` 1024px. (`@include bp.up(md)`, 모바일 우선으로 쓰기 어려운 경우에만 `bp.down(xs)`)

## 공통 mixin (`src/styles/_mixins.scss`)

| mixin | 용도 |
|---|---|
| `visually-hidden` | 화면에는 안 보이고 화면 낭독기만 읽는 요소 |
| `focus-ring` / `focus-outline` | 키보드 포커스 테두리 |
| `disabled` | 사용할 수 없는 상태 (흐리게, 커서) |
| `reduced-motion` | 기기에서 "움직임 줄이기"를 켰을 때 |
| `stack($gap)` | 세로로 쌓기 (`display: flex` + `flex-direction: column` + `gap`) |
| `header-panel($width)` | 헤더 버튼 아래로 펼쳐지는 창 (집중 소리 창, ☰ 메뉴) |
| `kbd` | 키보드 키 모양 (설정 창의 단축키 안내, 메뉴의 S) |

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
| `SwitchTrack` | 스위치 모양만 (줄 전체가 버튼인 메뉴 항목 안에서) | `checked` |
| `SegmentedControl` | 여러 개 중 하나 선택 (모드 탭) | `label`, `options`, `value`, `onChange`. 방향키로 이동 |
| `TextField` | 라벨 붙은 입력칸 | `label`, `hint`, `error`, `hideLabel` + input 속성 |
| `Checkbox` | 체크박스 | `label` + input 속성 |
| `Section` | 밑줄 있는 작은 제목 + 내용을 세로로 쌓은 묶음 (설정 창, 컴포넌트 미리보기) | `title`, `headingLevel`(2, 3), `children` |
| `Slider` | 끌어서 값 고르기 (소리 크기) | `label`, `value`, `onChange`, `min`, `max`, `step`, `format`, `disabled`, `startIcon`·`endIcon`(막대 양 끝 장식). 방향키로도 조절 |
| `Stepper` | − 값 + 숫자 조절 | `label`, `value`, `onChange`, `min`, `max`, `format`, `prefix` |
| `ProgressRing` | 원형 진행 띠 | `value`(남은 비율 0~1), `size`(기준 지름), `thickness`, `markers`, `glow`, `flashKey`, `overlay`, `children`. 화면 크기는 CSS 변수 `--ring-display-size`로 바꿀 수 있고 도장 위치·안쪽 크기가 같은 비율로 따라감 |

아이콘(`src/components/icons/`): `Play`, `Pause`, `Reset`, `Skip`, `Settings`, `Plus`, `Minus`, `Check`, `Close`, `Trash`, `Edit`, `Grip`(끌기 손잡이), `ChevronLeft`·`ChevronRight`(이전·다음), `Headphones`(집중 소리), `VolumeOff`·`VolumeLow`·`VolumeHigh`(스피커), `NoiseWhite`·`NoisePink`·`NoiseBrown`(노이즈 파형), `CloudRain`·`WindowRain`·`Flame`·`Tree`·`Waves`(자연의 소리), `Timer`·`Calendar`(페이지 메뉴), `Sun`, `Moon`, `Paw`, `Medal` (새 아이콘은 같은 폴더의 `Icon`으로 만듦)
- 모든 아이콘은 `size`(기본 20), `title`을 받고, 색은 글자색을 따릅니다. 목록에 아이콘을 담아 둘 때는 `IconComponent` 타입을 씁니다 (예: 집중 소리 `FOCUS_SOUNDS`의 `icon`).
- 새 아이콘은 `icons.tsx`에 24×24 격자, 선 두께 2 기준으로 그립니다.

### 화면 틀 (`src/components/layout/`, `src/app/_components/`)
- `AppHeader`: 로고 + `nav`(페이지 메뉴) + 오른쪽 버튼들. 좁은 휴대폰에서는 로고 글자를 숨김
- `AppNav`: 타이머 / 캘린더 메뉴. 아이콘 + 이름, 휴대폰(480px 미만)은 아이콘만(이름은 화면 낭독기와 툴팁). 지금 페이지는 둥근 흰 배경 + 강조색, `aria-current="page"`
- `PageMain`: 페이지 본문. 휴대폰은 위아래로 쌓고, 넓은 화면은 왼쪽(넓게)·오른쪽 두 칸 (타이머 | 할 일, 달력 | 날짜 상세)
- `HeaderMenu`(`src/app/_components/`): 헤더 오른쪽 끝 ☰ 메뉴. 다크 모드 스위치, 설정(설정 창과 S 단축키도 여기서), 사용법
- `AppShell`(`src/app/_components/`): 모든 페이지의 틀. 저장값 불러오기(`useStoresReady()`로 알려줌), 헤더, 모드별 배경색, `TimerRuntime`(어느 페이지에서든 완료 처리·알림·탭 제목·화면 켜두기·완료 팝업)

### 기능별 컴포넌트
특정 기능에서만 쓰는 컴포넌트는 `src/features/<기능>/components/`에 둡니다.
- 타이머: `TimerScreen`(페이지), `TimerRuntime`(앱 틀에서 한 번), `TimerPanel`(카드 조립), `ModeSwitcher`(모드 탭 + 전환 확인), `TimerRing`(진행 띠 + 효과), `KkamiPhoto`, `TimerControls`, `CycleProgress`, `CompletionDialog`(+ `useCompletionDialog.ts`: 언제 보일지, 자동 시작 카운트다운), `Celebration`, `TestModeBadge`
- 할 일: `TaskPanel`, `SortableTaskList`(끌어서 순서 바꾸기, 묶음마다 하나), `TaskForm`, `TaskItem`, `TaskDoneCheck`, `PawCount`(🐾 완료/예상)
- 기록: `TodaySummary`, 오늘 기록 훅 `useTodayFocus()` (헤더의 오늘 기록, 🏅 메달 버튼이 같이 씀). `sessions.ts`: 집중 세션만 고르기(`focusSessions`), 기록의 할 일 제목 찾기(`taskTitleOf`), 날짜별 요약(`getDayStats`: 집중 횟수·시간·사이클 번호), 기간 합계(`sumDays`). 헤더의 오늘 기록, 수료증, 캘린더, 통계가 같이 씀
- 캘린더(`src/features/calendar/`): `calendar.ts`(보이는 달과 이동, 달력 칸, 그 달의 범위 `monthBounds`, 색 단계, 그날의 할 일. 순수 함수, 테스트), `CalendarScreen`(페이지), `MonthCalendar`(달력, 칸 하나는 `DayCell`), `DayDetail`(날짜 상세)
- 통계(`src/features/stats/`): `stats.ts`(연속 일수 `getStreak`, 최근 n일과 그 전 n일 `getRecentComparison`, 최근 n일 막대 `getRecentDays`. 순수 함수, 테스트), `StatsPanel`(캘린더 맨 위 카드: 요약 4칸, CSS 막대 차트, 기록 없을 때 안내)
  - 날짜 도우미는 `src/lib/date.ts`: `startOfMonth`, 요일 이름 `WEEKDAY_NAMES`(달력과 막대 차트가 같이 씀)
- 설정: `SettingsDialog`(☰ 메뉴나 S 키로 열림), 묶음별 `TimerSection`, `AlertSection`, `DisplaySection`, `ShortcutSection`, `DataSection`, 안내 문구 `SettingsNote`. 묶음 모양은 공통 `Section`, 한 줄 모양은 공통 `FieldRow`
  - 설정 되돌리기, 모든 데이터 지우기는 여러 store를 함께 바꾸므로 `src/features/settings/resetData.ts`에 둠
- 알림(`src/features/alerts/`, 화면 없음). 밖에서는 `index.ts`에서 내보낸 것만 씀 (`useAlerts`, `prepareAlerts`, 설정 화면용 `previewAlertSound`, 알림 권한 함수 등)
  - `alerts.ts`: 다음 알림 계산, 알림 문구 (순수 함수)
  - `scheduler.ts`: 예약·취소·중복 방지 규칙. 시간, 소리, 알림을 바깥에서 끼워 넣어(`AlertEnv`) 테스트 가능
  - `sound.ts` / `output.ts` / `chime.ts` / `sounds.ts`: 브라우저 오디오 통로, 알림 소리 통로와 크기, 소리 만들기, 음 정의. 오디오 자체(만들기, 깨우기)는 집중 소리와 함께 쓰는 `src/lib/audio.ts`
  - `notify.ts`: 브라우저 알림과 권한, `prepare.ts`: 시작할 때 오디오 깨우기와 권한 요청, `preview.ts`: 설정의 미리 듣기
  - `useAlerts.ts`: 스케줄러를 타이머와 브라우저 기능에 연결하는 훅
- 수료증(`src/features/certificate/`): 밖에서는 `CertificateLauncher`(완료 팝업의 버튼, 캘린더의 "제 N호 수료증", `number`로 사이클 지정), `TodayCertificateButton`(헤더의 🏅 오늘 사이클 수 버튼)을 씀
  - `certificate.ts`: N번째(없으면 최근) 사이클 수료증 내용 계산 (순수 함수, 테스트). 시간 표기 `formatDuration`은 `src/lib/date.ts`
  - `render/layout.ts`: 이미지 크기, 색, 위치(위에서부터 차례로). 디자인을 고칠 때는 주로 여기만 바꿈
  - `render/drawCertificate.ts`: 1080×1920 캔버스에 그리기, `render/canvas.ts`: 글자 쓰기(`drawText`)·둥근 사각형·글자 줄이기·원형 글자·발자국 등 그리기 도우미
  - `share.ts`: 공유 창, 내려받기 / `components/CertificateDialog`: 미리보기, 할 일 보이기, 공유·저장
  - `components/useCertificateImage.ts`: 이미지를 미리 만들어 둠. 내용이 실제로 바뀔 때만 다시 그리고, 다 만들기 전에는 공유·저장을 막고, 쓰지 않는 이미지 주소는 정리
- 마스코트(`src/assets/mascot/`): `kkami-graduate.svg`는 수료증, `kkami-basic.svg`는 캘린더의 기록 없는 날, `kkami-icon.svg`는 로고·파비콘 등에 쓸 예정
- 집중 소리(`src/features/focus-sound/`): 밖에서는 `FocusSoundButton`(헤더 🎧 + 펼침 창), `useFocusSound`(앱 틀에서 한 번), `prepareFocusSound`(시작 버튼)를 씀
  - `sounds.ts`: 소리 목록과 창의 묶음(`FOCUS_SOUND_GROUPS`). 노이즈는 만드는 함수, 녹음은 파일 주소와 이음매 길이, 크기 맞춤 값
  - `recordings.json`: 녹음마다 원본 파일, 자를 구간, 이음매 길이 (다듬기 스크립트와 앱이 함께 읽음)
  - `noise.ts`: 노이즈 만들기, 크기 맞추기, 끊김 없이 반복되게 잇기 (순수 함수, 테스트)
  - `player.ts`: "지금 들려야 할 소리"를 받아 서서히 켜고 끄고 바꿈, 녹음 받기, 미리 듣기
  - `components/FocusSoundPanel`: 노이즈 / 자연의 소리를 세 칸씩(아이콘 위, 이름 아래, 설명은 툴팁), 집중 중이면 고른 칸에 재생 중 막대, 소리 크기(양쪽 스피커 아이콘)
- 단축키(`src/features/shortcuts/`, 화면 없음): `shortcuts.ts`에 키 정의(`SHORTCUTS`)와 판별 규칙(`matchShortcut`, 순수 함수). 컴포넌트는 `useShortcuts({ toggle, reset, ... })`로 자기 동작만 연결 (타이머 버튼은 Space·R·N, 설정 버튼은 S). `focusSource.ts`는 포커스가 키보드로 옮겨 왔는지 기록 (Space를 버튼에 맡길지 판단)
- 저절로 뜨는 팝업 기다리기: `src/lib/popupHold.ts`. 사용자가 직접 연 창(설정, 수료증)은 `useHoldAutoPopups()`를 부르고, 완료 팝업은 `useAutoPopupsHeld()`가 false일 때 뜸. 새로 만드는 "사용자가 여는 창"도 같은 훅을 부르면 됨
- 탭을 보고 있는지: `src/lib/usePageVisible.ts` (자동 시작 카운트다운은 탭을 보고 있을 때만 시작)
- 화면 꺼짐 방지: `src/lib/useWakeLock.ts`의 `useWakeLock(active)`. 어느 페이지든 "진행 중 + 설정 켜짐"일 때 켬 (`TimerRuntime`)
- 다른 탭과 맞추기: `src/lib/useTabSync.ts`의 `useTabSync(ready)` (앱 틀에서 한 번). 다른 탭이 저장하면 다시 불러오고, 완료 팝업 닫힘을 다른 탭에 알림(`BroadcastChannel`)
- 소리와 알림을 낼 탭: `src/lib/soundTab.ts`. 소리를 내는 코드는 `isSoundTab()` / `useIsSoundTab()`으로 확인 (알림 스케줄러, 집중 소리). 기록 중복 확인은 `sessions.ts`의 `newSessions`
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
- 2026-11-08: 타이머 화면 한 화면 맞춤 (ProgressRing 크기 조절, 헤더 메달 버튼)
- 2026-11-08: 팝업 기다리기(popupHold), 탭 보임 여부(usePageVisible) 추가
- 2026-11-08: 전체 리팩토링. `Section` 컴포넌트, `stack` mixin, `useTodayFocus` 추가, 완료 팝업 훅 분리, 남은 시간 글자 크기를 토큰(`--font-size-display`)으로
- 2026-11-08: `Grip` 아이콘, 할 일 끌어서 순서 바꾸기(`SortableTaskList`) 추가
- 2026-11-08: 캘린더 페이지. 화면 틀(`AppShell`, `AppNav`, `PageMain`), `ChevronLeft`·`ChevronRight` 아이콘, `bp.down` 추가
- 2026-11-08: 집중 소리 (`Headphones` 아이콘, 헤더 펼침 창), 공용 오디오 `src/lib/audio.ts`, 난수 `src/lib/random.ts`
- 2026-11-08: 백로그 I-005·I-006 아이콘 13개, `Slider` 양 끝 아이콘, 메뉴 아이콘·둥근 배경
- 2026-11-08: 통계(`StatsPanel`), `sumDays`, `monthBounds`, `startOfMonth`, `WEEKDAY_NAMES`
- 2026-11-08: 탭 여러 개 (`useTabSync`, `soundTab`, `newSessions`)
- 2026-11-08: ☰ 메뉴(`HeaderMenu`), `Menu`·`Book` 아이콘, `SwitchTrack`(스위치 모양만), mixin `header-panel`·`kbd`. `ThemeToggle`, `SettingsButton` 삭제
