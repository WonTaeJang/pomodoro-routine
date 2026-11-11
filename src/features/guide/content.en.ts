import {
  FOCUS_SOUND_GROUPS,
  FOCUS_SOUND_IDS,
} from "@/features/focus-sound/sounds";
import { DEFAULT_SETTINGS as D } from "@/features/timer/timer";
import { getTranslator } from "@/i18n";
import type { GuideContent } from "./content";

/** 사용법 글 (영어). 한국어(content.ko.ts)와 같은 모양 */

const t = getTranslator("en");
/** 집중 소리 개수와 묶음 이름 ("noise, nature sounds and places") */
const soundCount = FOCUS_SOUND_IDS.length;
const soundGroups = new Intl.ListFormat("en").format(
  FOCUS_SOUND_GROUPS.map((group) =>
    t(`focusSound.groups.${group.id}`).toLowerCase(),
  ),
);

const content: GuideContent = {
  page: {
    title: "How to use",
    intro: "Here's how to focus and take breaks with Kkami.",
    tocLabel: "Contents",
  },
  inlineIcons: {
    paw: "paw print",
    calendar: "calendar",
    menu: "menu",
    play: "start button",
    reset: "reset button",
    skip: "next session button",
    grip: "drag handle",
    headphones: "focus sounds button",
    medal: "medal",
  },
  sections: [
    {
      id: "pomodoro",
      icon: "paw",
      title: "What is Pomodoro?",
      points: [
        `A time management method: focus for ${D.focusMinutes} minutes, rest for ${D.shortBreakMinutes}, and repeat.`,
        `After ${D.longBreakInterval} focus sessions, take a longer ${D.longBreakMinutes}-minute break. That's one cycle.`,
        "Short sessions make it easier to start, and set breaks keep you from burning out.",
      ],
    },
    {
      id: "timer",
      icon: "timer",
      title: "Timer",
      points: [
        "Press {play} to start. When time's up, you'll get an alert and move on to the next session.",
        "{reset} restarts the current session, and {skip} jumps to the next one. You can also pick focus, short break or long break from the tabs at the top.",
        "In Settings you can change the durations, how often long breaks come, and auto-start. Auto-start begins after 5 seconds and stops at the end of a cycle.",
      ],
    },
    {
      id: "tasks",
      icon: "check",
      title: "Tasks",
      points: [
        "Write down a task and set how many focus sessions you expect it to take with {paw}.",
        "Each time you finish a focus session, the task marked 'Focusing' gets one more {paw}.",
        "Drag the {grip} handle on the left to reorder tasks. Works with both mouse and touch.",
        "Check off finished tasks and clear them with 'Clear completed'. They stay in the calendar.",
      ],
    },
    {
      id: "focus-sound",
      icon: "headphones",
      title: "Focus sounds",
      points: [
        `Pick from ${soundCount} sounds (${soundGroups}) with {headphones} at the top.`,
        "Choose 'Random' to get a different sound each focus session, never the same one twice in a row.",
        "Sounds play only while you're focusing, and turn off during breaks or when paused.",
        "Even with several tabs open, sound plays only in the tab you clicked last.",
      ],
    },
    {
      id: "calendar",
      icon: "calendar",
      title: "Calendar and stats",
      points: [
        "See how many focus sessions and how much time you put in each day, and what you got done. Darker days mean more focus.",
        "Stats at the top show your streak, the last 7 days, this month and all-time totals at a glance.",
      ],
    },
    {
      id: "certificate",
      icon: "medal",
      title: "Kkami certificate",
      points: [
        `Finish a cycle (${D.longBreakInterval} focus sessions) and a {medal} appears at the top.`,
        "Press {medal} to save or share that day's certificate as an image.",
      ],
    },
    {
      id: "alerts",
      icon: "bell",
      title: "Alerts",
      points: [
        "A chime plays when a session ends.",
        "If you're looking at another tab or app, you'll get a browser notification too. Your browser asks for permission the first time you start.",
        "You can change the volume or turn alerts off in Settings.",
      ],
    },
    {
      id: "shortcuts",
      icon: "keyboard",
      title: "Keyboard shortcuts",
      points: ["Shortcuts don't work while you're typing or a dialog is open."],
    },
    {
      id: "data",
      icon: "save",
      title: "Where is my data saved?",
      points: [
        "Your tasks and history are saved only in this browser. They don't sync to other devices yet.",
        "Clearing your browser data also deletes your history.",
        "Under 'Data' in Settings, you can reset settings to their defaults.",
      ],
    },
  ],
  onboarding: {
    skip: "Skip",
    prev: "Back",
    next: "Next",
    done: "Get started",
    moreGuide: "See the full guide",
    replay: "Show intro again",
    progress: (current, total) => `${current} of ${total}`,
  },
  slides: [
    {
      id: "welcome",
      title: "Welcome to Kkamodoro",
      points: [
        `Focus for ${D.focusMinutes} minutes, rest for ${D.shortBreakMinutes}, and repeat.`,
        `After ${D.longBreakInterval} focus sessions, take a ${D.longBreakMinutes}-minute break and earn a Kkami certificate.`,
      ],
    },
    {
      id: "start",
      title: "Add a task and start",
      points: [
        "Write what you'll focus on and how many sessions you expect it to take with {paw}.",
        "Press {play} to start. Each focus session you finish adds a {paw} to your task.",
      ],
    },
    {
      id: "more",
      title: "There's more",
      points: [
        "{headphones} Focus sounds: focus to rain, a crackling fire and more.",
        "{calendar} Calendar: see your daily history and streak.",
        "{menu} Menu: dark mode, language, settings and the guide.",
      ],
    },
    {
      id: "shortcuts",
      title: "Faster with the keyboard",
      points: ["Press these anywhere outside a text field."],
      keyboardOnly: true,
    },
  ],
};

export default content;
