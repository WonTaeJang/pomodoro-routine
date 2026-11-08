import { FOCUS_SOUND_GROUPS } from "@/features/focus-sound/sounds";
import { DEFAULT_SETTINGS as D } from "@/features/timer/timer";
import { getTranslator } from "@/i18n";
import type { GuideContent } from "./content";

/** 사용법 글 (한국어). 다른 언어 파일(content.en.ts)도 같은 모양 */

const t = getTranslator("ko");
/** 집중 소리 묶음마다 "노이즈 3가지" */
const soundGroups = FOCUS_SOUND_GROUPS.map(
  (group) => `${t(`focusSound.groups.${group.id}`)} ${group.ids.length}가지`,
).join(", ");

const content: GuideContent = {
  page: {
    title: "사용법",
    intro: "까미와 함께 집중하고 쉬는 방법을 알려드려요.",
    tocLabel: "목차",
  },
  inlineIcons: {
    paw: "발자국",
    calendar: "캘린더",
    menu: "메뉴",
    play: "시작 버튼",
    reset: "처음부터 버튼",
    skip: "다음 세션 버튼",
    grip: "손잡이",
    headphones: "집중 소리 버튼",
    medal: "메달",
  },
  sections: [
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
        `위쪽 {headphones}에서 ${soundGroups} 중에 골라요.`,
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
  ],
  onboarding: {
    skip: "건너뛰기",
    prev: "이전",
    next: "다음",
    done: "시작하기",
    moreGuide: "자세한 사용법 보기",
    replay: "안내 다시 보기",
    progress: (current, total) => `${total}장 중 ${current}장`,
  },
  slides: [
    {
      id: "welcome",
      title: "까모도로에 온 걸 환영해요",
      points: [
        `${D.focusMinutes}분 집중하고 ${D.shortBreakMinutes}분 쉬는 걸 반복해요.`,
        `집중을 ${D.longBreakInterval}번 마치면 ${D.longBreakMinutes}분 길게 쉬고, 까미 수료증을 받아요.`,
      ],
    },
    {
      id: "start",
      title: "할 일을 적고 시작해요",
      points: [
        "무엇에 집중할지 적고, 집중 몇 번이면 끝날지 예상 {paw}를 정해요.",
        "{play}를 누르면 시작해요. 집중을 마칠 때마다 할 일에 {paw}가 쌓여요.",
      ],
    },
    {
      id: "more",
      title: "이런 것도 있어요",
      points: [
        "{headphones} 집중 소리: 빗소리, 모닥불 같은 소리를 들으며 집중해요.",
        "{calendar} 캘린더: 날짜별 기록과 연속 일수를 봐요.",
        "{menu} 메뉴: 다크 모드, 언어, 설정, 사용법이 있어요.",
      ],
    },
    {
      id: "shortcuts",
      title: "키보드로 더 빠르게",
      points: ["입력칸 밖에서 누르면 바로 동작해요."],
      keyboardOnly: true,
    },
  ],
};

export default content;
