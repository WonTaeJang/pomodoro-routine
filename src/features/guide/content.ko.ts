import { FOCUS_SOUND_GROUPS } from "@/features/focus-sound/sounds";
import { DEFAULT_SETTINGS as D } from "@/features/timer/timer";

/**
 * 사용법 문구 (한국어). 사용법 페이지(I-010)와 첫 방문 안내(I-009)가 함께 씁니다.
 * 화면 코드에 글을 바로 쓰지 않고 여기에 모아 두어, 다른 언어는 이 파일만 옮기면 됩니다.
 * 시간·개수처럼 앱 설정에서 오는 값은 그 값을 그대로 씁니다 (앱이 바뀌어도 어긋나지 않게).
 */

export type GuideIcon =
  | "paw"
  | "timer"
  | "check"
  | "headphones"
  | "calendar"
  | "medal"
  | "bell"
  | "keyboard"
  | "save";

/**
 * 글 속에 넣는 앱 아이콘. 문구에 `{paw}`처럼 쓰면 그 자리에 아이콘이 들어갑니다.
 * label은 화면 낭독기가 아이콘 대신 읽는 말입니다.
 */
export const INLINE_ICON_LABELS = {
  paw: "발자국",
  play: "시작 버튼",
  reset: "처음부터 버튼",
  skip: "다음 세션 버튼",
  grip: "손잡이",
  headphones: "집중 소리 버튼",
  medal: "메달",
} as const;

export type InlineIcon = keyof typeof INLINE_ICON_LABELS;

export type GuideSection = {
  /** 주소 #뒤에 붙는 이름 (목차 링크) */
  id: string;
  icon: GuideIcon;
  title: string;
  points: string[];
};

const [noise, nature] = FOCUS_SOUND_GROUPS;

export const GUIDE = {
  title: "사용법",
  intro: "까미와 함께 집중하고 쉬는 방법을 알려드려요.",
  tocLabel: "목차",
} as const;

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "pomodoro",
    icon: "paw",
    title: "뽀모도로가 뭐예요?",
    points: [
      `${D.focusMinutes}분 집중하고 ${D.shortBreakMinutes}분 쉬는 걸 반복하는 시간 관리 방법이에요.`,
      `집중을 ${D.longBreakInterval}번 마치면 ${D.longBreakMinutes}분 동안 길게 쉬어요. 여기까지가 한 사이클이에요.`,
      "짧게 끊어서 집중하니 시작이 쉽고, 쉬는 시간이 정해져 있어 덜 지쳐요.",
    ],
  },
  {
    id: "timer",
    icon: "timer",
    title: "타이머",
    points: [
      "{play}를 누르면 시작해요. 시간이 다 되면 알림과 함께 다음 세션으로 넘어가요.",
      "{reset}는 지금 세션을 처음부터, {skip}는 다음 세션으로 넘겨요. 위의 탭으로 집중·짧은 휴식·긴 휴식을 직접 고를 수도 있어요.",
      "설정에서 시간, 긴 휴식 주기, 자동 시작을 바꿀 수 있어요. 자동 시작은 5초 뒤에 시작하고, 사이클을 마치면 멈춰요.",
    ],
  },
  {
    id: "tasks",
    icon: "check",
    title: "할 일",
    points: [
      "할 일을 적고, 집중 몇 번이면 끝날지 예상 {paw}를 정해요.",
      "집중을 마칠 때마다 '집중 중'인 할 일에 {paw}가 하나씩 쌓여요.",
      "왼쪽 {grip} 손잡이를 끌어서 순서를 바꿔요. 마우스와 터치 모두 돼요.",
      "다 한 일은 체크하고 '완료한 할 일 정리'로 목록을 비워요. 한 일은 캘린더에 남아요.",
    ],
  },
  {
    id: "focus-sound",
    icon: "headphones",
    title: "집중 소리",
    points: [
      `위쪽 {headphones}에서 ${noise.title} ${noise.ids.length}가지, ${nature.title} ${nature.ids.length}가지 중에 골라요.`,
      "소리는 집중하는 동안에만 나고, 휴식이나 일시정지 때는 꺼져요.",
      "탭을 여러 개 열어도 마지막으로 누른 탭에서만 나요.",
    ],
  },
  {
    id: "calendar",
    icon: "calendar",
    title: "캘린더와 통계",
    points: [
      "날짜별 집중 횟수와 시간, 그날 한 일을 볼 수 있어요. 색이 진할수록 많이 집중한 날이에요.",
      "맨 위 통계에서 연속 일수, 최근 7일, 이번 달, 전체 기록을 한눈에 봐요.",
    ],
  },
  {
    id: "certificate",
    icon: "medal",
    title: "까미 수료증",
    points: [
      `사이클(집중 ${D.longBreakInterval}번)을 마치면 위쪽에 {medal}가 생겨요.`,
      "{medal}를 누르면 그날의 수료증을 이미지로 저장하거나 공유할 수 있어요.",
    ],
  },
  {
    id: "alerts",
    icon: "bell",
    title: "알림",
    points: [
      "세션이 끝나면 알림 소리가 울려요.",
      "다른 탭이나 앱을 보고 있으면 브라우저 알림도 와요. 처음 시작할 때 브라우저가 알림을 허락할지 물어봐요.",
      "소리 크기와 알림은 설정에서 바꾸거나 끌 수 있어요.",
    ],
  },
  {
    id: "shortcuts",
    icon: "keyboard",
    title: "단축키",
    points: ["입력칸에 쓰는 중이거나 창이 열려 있을 때는 동작하지 않아요."],
  },
  {
    id: "data",
    icon: "save",
    title: "기록은 어디에 저장되나요?",
    points: [
      "할 일과 기록은 지금 쓰는 브라우저에만 저장돼요. 다른 기기와는 아직 이어지지 않아요.",
      "브라우저 데이터를 지우면 기록도 함께 사라져요.",
      "설정의 '데이터'에서 설정을 되돌리거나 모든 데이터를 지울 수 있어요.",
    ],
  },
];
