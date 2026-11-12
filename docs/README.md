# 문서 목록

**까모도로(Kkamodoro)** 를 개발하며 논의하고 결정한 내용을 정리하는 폴더입니다.

| 문서 | 내용 |
|---|---|
| [01-what-is-pomodoro.md](./01-what-is-pomodoro.md) | 뽀모도로 기법이란 무엇인가 |
| [02-mvp-scope.md](./02-mvp-scope.md) | 개발 범위 (MVP와 이후 단계) |
| [03-decisions.md](./03-decisions.md) | 결정 기록과 아직 정하지 않은 항목 |
| [04-reference-pomodotree.md](./04-reference-pomodotree.md) | 참고 사이트 PomodoTree 분석 |
| [05-setup.md](./05-setup.md) | 개발 환경 설정, 설치와 실행 방법, 폴더 구조 |
| [06-design-system.md](./06-design-system.md) | 디자인 토큰과 공통 컴포넌트 |
| [07-pet-prototype.md](./07-pet-prototype.md) | Rive 돌봄 프로토타입 실행, 에셋 제작, 데이터 연결 |

## 개발 규칙

| 문서 | 내용 |
|---|---|
| [commit.md](./commit.md) | Git 커밋 규칙, 버전 올리기 규칙 |
| [../CHANGELOG.md](../CHANGELOG.md) | 버전별 바뀐 점 |
| [backlog.md](./backlog.md) | 진행할 버그·개선과 완료 조건 |
| [backlog-completed.md](./backlog-completed.md) | 완료 결과와 기존 커밋·버전 기록 |

## 작성 규칙

- 논의·기획 문서는 `번호-주제.md` 형식으로 만듭니다. 개발 규칙 문서(`commit.md` 등)는 번호 없이 둡니다.
- 확정 설계와 이유는 `03-decisions.md`, 남은 작업·미정 사항·완료 조건은 `backlog.md`, 구현 방법은 해당 기능 문서에서 관리합니다. 같은 내용을 여러 문서에 복사하지 않고 링크로 연결합니다.
- **논의가 끝난 문서는 결론만 관련 문서로 옮기고 바로 삭제합니다.** 비교·검토용으로만 쓰던 문서를 남겨두지 않습니다.
- 문서가 지워지거나 합쳐지면 번호를 다시 매기고, 이 목록과 문서 간 링크를 함께 고칩니다.
- 결정이 바뀌면 해당 문서의 "변경 이력"에 날짜와 이유를 남깁니다.

## 변경 이력

- 2026-11-12: 완료 목록 분리와 문서 역할 정리. 개발·커밋·버전 절차는 `commit.md`를 기준으로 통일.
