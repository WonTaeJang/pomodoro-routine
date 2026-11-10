# 까미 돌봄 프로토타입

개발 서버의 `/pet`에서 체험합니다. 기존 타이머와 별도인 실험 페이지이며,
집중 보상이나 육성 데이터 저장은 아직 연결하지 않았습니다.

## 동작

기획 결정은 [03-decisions.md](./03-decisions.md), 진행 상태는 [backlog.md](./backlog.md)의 I-020에서 관리합니다. 이 문서는 구현·재생성 방법을 설명합니다.

- 실제 Rive 파일에서 `Idle`과 `Happy` 애니메이션을 재생합니다.
- 강아지 또는 쓰다듬기 버튼 클릭, 터치, 누른 채 이동, 키보드 Enter/Space를 지원합니다.
- 마지막 쓰다듬기 후 2.8초가 지나면 대기로 돌아갑니다.
- 쓰담 횟수는 현재 페이지에서만 유지하며, 초기화 버튼으로 다시 시작합니다.
- 기기의 동작 줄이기 설정에서는 상태별 표정만 보여주고 움직임을 멈춥니다.
- 파일 로드 실패 시 다시 불러오기 버튼을 제공합니다.

## 파일과 데이터 계약

- `src/features/pet/components/PetPlayground.tsx`: React 인터랙션과 페이지 구성
- `src/features/pet/pet.ts`: 시각을 인자로 받는 쓰담 중복 방지·기쁨 종료·초기화 규칙
- `src/features/pet/usePetCare.ts`: 포인터 제스처와 타이머 연결·해제
- `src/features/pet/components/_room-art.scss`: 방에만 쓰는 도형 치수·팔레트
- `src/i18n/messages/ko.ts`, `en.ts`의 `pet`: 한국어·영어 문구
- `public/rive/kkami-pet.riv`: 실제 브라우저에서 재생하는 Rive 파일
- `src/assets/kkami-pet/scene.rml`: 편집 가능한 Rive 원본
- `scripts/generate-pet-rml.mjs`: 자체 제작 도트 그림과 타임라인을 재생성하는 스크립트
- Artboard: `Kkami`, State machine: `Pet`
- View model: `PetModel`, boolean property: `isHappy`

React가 `isHappy`를 갱신하면 Rive 상태 머신이 표정, 꼬리, 점프와 하트를 전환합니다.
캐릭터는 4단위 격자의 사각형으로 제작했고, 12fps의 hold 키프레임을 사용합니다.
Rive 내부 스크립트나 외부 캐릭터 에셋은 사용하지 않습니다.

## Rive 에셋 다시 만들기

공식 Rive CLI 1.9.2로 제작·검증했습니다. CLI가 설치되어 있고 로그인되어 있어야
`.riv`를 내보낼 수 있습니다. `--publish=local`은 파일 내보내기이며 웹사이트를 공개하지 않습니다.

```sh
node scripts/generate-pet-rml.mjs
rive src/assets/kkami-pet --verify
rive inspect src/assets/kkami-pet --summary
rive src/assets/kkami-pet --publish=local --output-dir=../../../public/rive
```

원본 RML을 직접 수정하면 생성 스크립트 재실행 시 덮어써지므로, 반복적인 변경은
생성 스크립트에도 반영합니다. 무료 Rive Workspace에서 내보낸 현재 파일에는
Rive 시작 스플래시가 포함되어 있습니다.

`npm run dev`와 `npm run build`는 `scripts/copy-rive-runtime.mjs`로 설치된
`@rive-app/webgl2`와 같은 버전의 WASM을 `public/rive/rive.wasm`에 복사합니다.
이 생성 파일은 Git에서 제외하며, 브라우저는 외부 CDN 없이 로컬 파일을 사용합니다.
개발 서버가 이미 켜진 상태에서 처음 추가했다면 복사 스크립트를 한 번 실행합니다.

## 검증

Node.js 22.12 이상에서 `npm run test:run`, `npm run lint`, `npm run format:check`, `npm run build`를 실행합니다. 브라우저에서는 대기 → 클릭·드래그·Enter/Space → 기쁨 → 자동 대기 복귀, 초기화, 모바일 화면과 언어 전환을 확인합니다.

알려진 문제: 새로고침 시 방 배경이 잠깐 노출되는 현상은 B-003으로 별도 추적합니다. 말풍선과 Rive 시작 화면의 레이어 순서는 수정했으며, 전체 로딩 표시 전환은 아직 개선 전입니다.

## 변경 이력

- 2026-11-10: I-020 구현 안내. 문서 번호·목록, 번역 사전, 공통 UI·스타일 및 기능 로직 구조에 맞춰 정리.
