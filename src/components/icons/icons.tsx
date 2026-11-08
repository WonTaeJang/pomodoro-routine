import { Icon, type IconProps } from "./Icon";

/** 시작 */
export function PlayIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 4.5v15l12-7.5z" fill="currentColor" />
    </Icon>
  );
}

/** 일시정지 */
export function PauseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect
        x="6"
        y="4.5"
        width="4"
        height="15"
        rx="1"
        fill="currentColor"
        stroke="none"
      />
      <rect
        x="14"
        y="4.5"
        width="4"
        height="15"
        rx="1"
        fill="currentColor"
        stroke="none"
      />
    </Icon>
  );
}

/** 리셋 (반시계 화살표) */
export function ResetIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5" />
      <path d="M3.5 3.5v5h5" />
    </Icon>
  );
}

/** 다음 세션으로 건너뛰기 */
export function SkipIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 5.5v13l9-6.5z" fill="currentColor" />
      <path d="M18.5 5.5v13" />
    </Icon>
  );
}

/** 설정 (조절 슬라이더) */
export function SettingsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </Icon>
  );
}

/** 추가 */
export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

/** 빼기 */
export function MinusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
    </Icon>
  );
}

/** 완료 체크 */
export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Icon>
  );
}

/** 닫기 */
export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

/** 삭제 */
export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />
    </Icon>
  );
}

/** 수정 */
export function EditIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M15 4.5l4.5 4.5L9 19.5H4.5V15zM13 6.5l4.5 4.5" />
    </Icon>
  );
}

/** 끌어서 옮기기 손잡이 (점 6개) */
export function GripIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <g fill="currentColor" stroke="none">
        <circle cx="9" cy="6" r="1.6" />
        <circle cx="15" cy="6" r="1.6" />
        <circle cx="9" cy="12" r="1.6" />
        <circle cx="15" cy="12" r="1.6" />
        <circle cx="9" cy="18" r="1.6" />
        <circle cx="15" cy="18" r="1.6" />
      </g>
    </Icon>
  );
}

/** 이전 (왼쪽 꺾쇠) */
export function ChevronLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M15 5l-7 7 7 7" />
    </Icon>
  );
}

/** 다음 (오른쪽 꺾쇠) */
export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 5l7 7-7 7" />
    </Icon>
  );
}

/** 헤드폰. 집중 소리 */
export function HeadphonesIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
      <rect x="3" y="14" width="4.5" height="6.5" rx="1.5" />
      <rect x="16.5" y="14" width="4.5" height="6.5" rx="1.5" />
    </Icon>
  );
}

/** 소리 끔 (스피커에 X) */
export function VolumeOffIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M11 5 6 9H3v6h3l5 4z" />
      <path d="m22 9-6 6M16 9l6 6" />
    </Icon>
  );
}

/** 작은 소리 */
export function VolumeLowIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M11 5 6 9H3v6h3l5 4z" />
      <path d="M15.5 9a4.5 4.5 0 0 1 0 6" />
    </Icon>
  );
}

/** 큰 소리 */
export function VolumeHighIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M11 5 6 9H3v6h3l5 4z" />
      <path d="M15.5 9a4.5 4.5 0 0 1 0 6M18.5 6a8.5 8.5 0 0 1 0 12" />
    </Icon>
  );
}

/** 백색소음: 촘촘하고 고르지 않은 파형 */
export function NoiseWhiteIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 12l2-5 2 10 2-8 2 6 2-9 2 11 2-8 2 7 2-6 2 2" />
    </Icon>
  );
}

/** 핑크 노이즈: 부드러운 물결 파형 */
export function NoisePinkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 12c1.5-4.5 3.5-4.5 5 0s3.5 4.5 5 0 3.5-4.5 5 0 3.5 4.5 5 0" />
    </Icon>
  );
}

/** 브라운 노이즈: 낮고 넓은 파형 */
export function NoiseBrownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 15c3-7 7-7 10 0s7 7 10 0" />
    </Icon>
  );
}

/** 비구름 */
export function CloudRainIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 15h10.5a3.5 3.5 0 0 0 .4-7A6 6 0 0 0 6.3 8.6 3.3 3.3 0 0 0 7 15z" />
      <path d="m8.5 18-1 3M12.5 18l-1 3M16.5 18l-1 3" />
    </Icon>
  );
}

/** 빗방울 맺힌 창문 */
export function WindowRainIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="3" width="17" height="18" rx="2" />
      <path d="M12 3v18M3.5 12h17" />
      <path d="M7.5 6.5v1.5M16 8v1.5M7.5 15.5V17M16 14.5V16" />
    </Icon>
  );
}

/** 불꽃 */
export function FlameIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3c.5 3.5 6 5.5 6 11a6 6 0 0 1-12 0c0-2.5 1.2-4.2 2.5-5.3.2 2.1 1.2 3.3 2.5 3.3 0-3.5-.7-6.2 1-9z" />
    </Icon>
  );
}

/** 나무 */
export function TreeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 2.5 18 10h-3l4 6H5l4-6H6z" />
      <path d="M12 16v5.5" />
    </Icon>
  );
}

/** 물결 (파도) */
export function WavesIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 8.5c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" />
      <path d="M2 13c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" />
      <path d="M2 17.5c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" />
    </Icon>
  );
}

/** 스톱워치 (타이머 페이지) */
export function TimerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M12 13.5V9.5M10 2.5h4M12 2.5V6M18.5 6.5l1.5-1.5" />
    </Icon>
  );
}

/** 달력 (캘린더 페이지) */
export function CalendarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </Icon>
  );
}

/** 라이트 모드 */
export function SunIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </Icon>
  );
}

/** 다크 모드 */
export function MoonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </Icon>
  );
}

/** 메뉴 (줄 세 개). 헤더 오른쪽 메뉴 버튼 */
export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" />
    </Icon>
  );
}

/** 펼친 책 (사용법) */
export function BookIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z" />
      <path d="M12 6.5v13" />
    </Icon>
  );
}

/** 메달. 완료한 사이클 표시에 사용 */
export function MedalIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 3l3 6.5M16 3l-3 6.5" />
      <circle cx="12" cy="15" r="5.5" />
      <path
        d="M12 12.5l.8 1.6 1.7.2-1.3 1.2.3 1.7-1.5-.8-1.5.8.3-1.7-1.3-1.2 1.7-.2z"
        fill="currentColor"
        strokeWidth={1}
      />
    </Icon>
  );
}

/** 까미 발자국. 완료한 뽀모도로 표시 등에 사용 */
export function PawIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <g fill="currentColor" stroke="none">
        <ellipse cx="12" cy="15.8" rx="4.6" ry="3.9" />
        <circle cx="6.3" cy="10.6" r="1.9" />
        <circle cx="9.8" cy="6.9" r="2" />
        <circle cx="14.2" cy="6.9" r="2" />
        <circle cx="17.7" cy="10.6" r="1.9" />
      </g>
    </Icon>
  );
}
