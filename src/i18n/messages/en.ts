import type { Messages } from "./ko";

/**
 * 화면 문구 사전 (영어). 한국어(ko.ts)와 같은 모양이어야 하고, 빠진 문구가 있으면 타입 오류.
 * 작은따옴표(')는 ICU 형식에서 특수 문자라 글 속 아포스트로피는 ’를 씁니다.
 */
const en: Messages = {
  pet: {
    walk: {
      start: "Go for a walk",
      status: "On a walk",
      return: "Go home",
      scene: "Kkami walking along a park path",
      error: "Could not load the walk.",
    },
    affinity: {
      label: "Bond",
      level: "Bond Lv.{level}",
      loading: "Loading",
      progress: "Bond level {level}, {points} points",
      points: "{points} / {next} points",
      max: "Max level · {points} points",
      today: "Pats today +{earned} / {max}",
      snackHint: "+{points} for every treat",
      hint: "+{points} for each of your first {count} pats daily. Your bond never decreases.",
      levelUp: "Closer to Kkami · Lv.{level}",
      stages: {
        "1": "Getting acquainted",
        "2": "Familiar faces",
        "3": "Good friends",
        "4": "Close friends",
        "5": "Best friends",
      },
    },
    storageIssue: {
      load: "Couldn’t load your record.",
      save: "Couldn’t save your record.",
      invalid: "The saved record couldn’t be read.",
      newer: "Refresh the page and try again.",
    },
    retrySave: "Retry",
    startled: "Surprised!",
    startleBubble: "Oh, hello there!",

    back: "Timer",
    label: "Kkami’s little room",
    name: "Kkami",
    idle: "Relaxed",
    sleeping: "Sleeping",
    sleepBubble: "Zzz…",
    wake: "Gently wake Kkami",
    wakeLabel: "Wake Kkami",
    happy: "Happy",
    bubble: "Take a little break with me?",
    happyBubble: "Hehe, one more!",
    pet: "Give a little pat",
    feed: "Give a treat",
    snackHappy: "Yummy",
    snackBubble: "Yum, thank you!",
    petLabel: "Pet Kkami",
    keyboard: "With a keyboard, focus the button and press Enter or Space.",
    count: "Total pats",
    loading: "Loading…",
    error: "Couldn’t load Kkami.",
    retry: "Try again",
    reset: "Replay wake-up",
    roomLabel: "KKAMI’S ROOM",
    patCount: "{count, plural, one {# pat} other {# pats}}",
  },
  common: {
    cancel: "Cancel",
    close: "Close",
    decrease: "Decrease {label}",
    increase: "Increase {label}",
    opensInNewTab: "(opens in a new tab)",
    today: "Today",
    noRecords: "No records",
    volume: "Volume",
  },
  app: {
    name: "Kkamodoro",
    nav: {
      label: "Pages",
      timer: "Timer",
      calendar: "Calendar",
    },
    menu: {
      label: "Menu",
      darkMode: "Dark mode",
      language: "Language",
      settings: "Settings",
      guide: "How to use",
      login: "Log in",
      profile: "My profile: {name}",
    },
  },
  kkami: {
    default: "Kkami looking up, waiting",
    done: "Kkami smiling",
    focus: "Kkami lying quietly nearby",
    "short-break": "Kkami heading out for a walk",
    "long-break": "Kkami full of excitement",
  },
  timer: {
    label: "Timer",
    currentTask: "Current task",
    modeLabel: "Timer mode",
    modes: {
      focus: "Focus",
      "short-break": "Short break",
      "long-break": "Long break",
    },
    cycle: {
      longBreakNow: "Time for a long break",
      nextIsLong: "Your next break is a long one",
      untilLongBreak:
        "{count, plural, one {# more session} other {# more sessions}} until a long break",
      progress: "{done} of {total} focus sessions done this cycle",
    },
    status: {
      paused: "Paused",
      focus: {
        running: "Focusing",
        idle: "Ready to focus?",
      },
      "short-break": {
        running: "On a short walk with Kkami",
        idle: "Time for a short walk with Kkami",
      },
      "long-break": {
        running: "On a long walk with Kkami",
        idle: "Time for a long walk with Kkami",
      },
    },
    controls: {
      start: "Start",
      pause: "Pause",
      resume: "Resume",
      reset: "Reset",
      skip: "Next session",
      confirm: {
        reset: {
          title: "Restart this focus session?",
          action: "Reset",
          message:
            "This focus session won’t count as completed, and the timer goes back to the start.",
        },
        skip: {
          title: "Skip this focus session?",
          action: "Skip",
          message:
            "This focus session won’t count as completed, and you’ll go straight to your break.",
        },
      },
    },
    switchMode: {
      title: {
        focus: "Switch to focus?",
        "short-break": "Switch to a short break?",
        "long-break": "Switch to a long break?",
      },
      confirm: "Switch",
      message:
        "Your {mode} session is still in progress. If you switch, it won’t count as completed.",
    },
    completion: {
      cycle: {
        title: "Cycle complete!",
        message:
          "You finished all {count} focus sessions. Go for a {walk, select, long {long} other {short}} walk with Kkami.",
      },
      focus: {
        title: "Nice work!",
        message:
          "One pomodoro done. Go for a {walk, select, long {long} other {short}} walk with Kkami.",
      },
      break: {
        title: "Break’s over!",
        message: "Kkami is waiting for you. Ready to focus again?",
      },
      startNow: "Start now",
      later: "Later",
      startNext: "Start {mode} →",
      autoStart: "{mode} starts in {seconds}s",
    },
    testMode: {
      badge: "Test mode · {seconds}s",
      off: "Off",
    },
  },
  tasks: {
    title: "Tasks",
    remaining: "{count} left",
    clearDone: {
      label: "Clear completed",
      hint: "Hides them from the list. They stay in the calendar",
    },
    add: "Add",
    save: "Save",
    placeholder: "What will you focus on?",
    empty: {
      title: "Add a task and start focusing.",
      hint: "Each focus session you finish adds a <paw></paw> to the selected task.",
    },
    estimate: {
      label: "Estimated pomodoros",
      short: "Est.",
    },
    active: "Focusing",
    select: {
      label: "Focus on {title}",
      button: "Select",
    },
    edit: "Edit {title}",
    delete: "Delete {title}",
    pawCount: {
      label: "{done} of {estimate} estimated pomodoros done",
      title: "{done} done · {estimate} estimated",
    },
    doneCheck: {
      reachedEstimate:
        "You hit your estimate of {count, plural, one {# pomodoro} other {# pomodoros}}!",
      label: "I finished this task",
      next: "Next task: {title}",
      noneLeft: "No tasks left. Try adding a new one.",
    },
    sort: {
      roleDescription: "sortable task",
      handle: "Reorder {title}",
      handleHint: "Drag to reorder",
      instructions:
        "To reorder, press Space or Enter, move with the up and down arrow keys, then press Space or Enter again to drop. Press Escape to cancel.",
      pickedUp: "Picked up “{title}”. It’s in position {position} of {total}.",
      movedTo: "Position {position} of {total}.",
      dropped: "Dropped “{title}” at position {position} of {total}.",
      droppedInPlace: "Dropped “{title}” back in place.",
      cancelled: "Move cancelled. “{title}” went back to its place.",
    },
  },
  history: {
    today: "Today {count} · {minutes} min",
  },
  focusSound: {
    title: "Focus sounds",
    buttonPlaying: "Focus sounds: {sound}",
    buttonRandom: "Focus sounds: random ({sound})",
    hint: "Plays only while you focus.",
    hintWithPreview: "Plays only while you focus. Pick one to hear a preview.",
    kind: "Sound",
    off: {
      label: "Off",
      description: "Focus in silence",
    },
    random: {
      label: "Random",
      description: "New sound each session",
      now: "This session: {sound}",
      next: "Next session: {sound}",
    },
    groups: {
      noise: "Noise",
      nature: "Nature sounds",
      places: "Places",
    },
    sounds: {
      white: { label: "White noise", description: "Even hiss" },
      pink: { label: "Pink noise", description: "Soft rush" },
      brown: { label: "Brown noise", description: "Deep rumble" },
      rain: { label: "Rain", description: "Steady rainfall" },
      "window-rain": {
        label: "Rain on window",
        description: "Tapping on glass",
      },
      fireplace: { label: "Fireplace", description: "Crackling logs" },
      forest: { label: "Forest", description: "Birds and leaves" },
      waves: { label: "Waves", description: "Calm sea" },
      airplane: { label: "Airplane cabin", description: "Low engine hum" },
    },
    playing: "(playing)",
  },
  alerts: {
    "focus-end": {
      title: "Focus done! 🐾",
      body: "Nice work. Go for a short walk with Kkami.",
    },
    "cycle-done": {
      title: "Cycle complete! 🏅",
      body: "All focus sessions done. Go for a long walk with Kkami.",
    },
    "break-end": {
      title: "Break’s over!",
      body: "Kkami is waiting for you. Ready to focus again?",
    },
  },
  calendar: {
    monthSummary:
      "{focusCount, plural, one {# focus} other {# focus sessions}} · {cycles, plural, one {# cycle} other {# cycles}}",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    legend: {
      less: "Less",
      more: "More",
      cycle: "Cycle complete",
    },
    cell: {
      focusCount:
        "{count, plural, one {# focus session} other {# focus sessions}}",
      cycleCount: "{count, plural, one {# cycle} other {# cycles}}",
    },
    day: {
      future: "This day hasn’t come yet.",
      empty: "No records for this day. Kkami took a good rest, too.",
      focus: "Focus",
      focusCount: "{count}",
      focusTime: "Focus time",
      cycles: "Cycles",
      cycleCount: "{count}",
      certificate: "Certificate No. {number}",
      completed: {
        title: "Completed tasks",
        empty: "No tasks completed this day.",
      },
      inProgress: {
        title: "Tasks in progress",
        empty: "You finished every task you focused on this day.",
      },
      taskFocusCount:
        "{count, plural, one {# focus session} other {# focus sessions}} this day",
    },
  },
  stats: {
    title: "Stats",
    empty:
      "Finish your first focus session and your records will show up here.",
    streak: {
      title: "Streak",
      days: "{count, plural, one {# day} other {# days}}",
      best: "Best: {count, plural, one {# day} other {# days}}",
      keepGoing: "Focus today for day {count}",
    },
    week: {
      title: "Last 7 days",
      same: "Same as the 7 days before",
      diff: "<nowrap>{diff}</nowrap> vs. the 7 days before",
    },
    month: {
      title: "This month",
    },
    cycles: "{count, plural, one {# cycle} other {# cycles}}",
    all: {
      title: "All time",
      focusCount: "{count, plural, one {# session} other {# sessions}}",
    },
    chart: {
      title: "Focus time, last 7 days (min)",
    },
  },
  certificate: {
    title: "Kkamodoro Certificate",
    make: "Make certificate",
    todayButton:
      "{count, plural, one {# cycle} other {# cycles}} done today, make certificate",
    save: "Save image",
    share: "Share",
    preview: "{title} preview",
    status: {
      failed: "Couldn’t make the certificate. Please open it again.",
      making: "Making your certificate…",
      noCycle: "You haven’t completed a cycle yet.",
    },
    hint: {
      shareFailed: "Couldn’t share. Save the image and post it instead.",
      share: "Choose Instagram in the share menu to post it to your story.",
      save: "Save the image and post it to your Instagram story.",
    },
    showTasks: {
      label: "Show tasks",
      description: "Add the tasks from this cycle to the certificate",
    },
    message: {
      withLength:
        "For completing {count, plural, one {# focus session} other {# focus sessions}} of {length},",
      withoutLength:
        "For completing {count, plural, one {# focus session} other {# focus sessions}},",
      award: "this certificate is proudly awarded.",
    },
    image: {
      header: "Cycle complete!",
      badge: "No. {number} · {date}",
      focusTime: "Focus time",
      pomodoros: "Pomodoros",
      pomodoroCount: "{count}",
      cycleCount: "{count, plural, one {# cycle} other {# cycles}}",
      doneToday: "Done today",
      doneThatDay: "Done that day",
      tasks: "What I worked on",
      moreTasks: "+{count} more",
      tasksHidden: "One more step forward today",
      noTasks: "Pure focus, no task list needed",
      stamp: "By Kkami",
    },
  },
  settings: {
    title: "Settings",
    shortcuts: "Keyboard shortcuts",
    timer: {
      title: "Timer",
      minutes: "{value} min",
      length: {
        focus: "Focus length",
        "short-break": "Short break length",
        "long-break": "Long break length",
      },
      interval: {
        label: "Long break every",
        description:
          "Long break after {count, plural, one {# focus session} other {# focus sessions}}",
        value: "{value}×",
      },
      autoStartBreaks: {
        label: "Auto-start breaks",
        description: "Start your break as soon as focus ends",
      },
      autoStartFocus: {
        label: "Auto-start focus",
        description: "Start the next focus session as soon as a break ends",
      },
      testMode: "Test mode is on, so every session lasts {seconds} seconds.",
      appliesNext:
        "New durations apply from the next session, after the current one ends.",
    },
    alerts: {
      title: "Alerts",
      sound: {
        label: "Alert sound",
        description: "Plays a chime when a session ends",
      },
      preview: "Preview",
      notifications: {
        label: "Browser notifications",
        available:
          "Lets you know when a session ends while you’re in another tab",
        denied:
          "Notifications are blocked in your browser. Allow them in the site settings next to the address bar",
        unsupported: "This browser doesn’t support notifications",
      },
    },
    display: {
      title: "Display",
      language: "Language",
      theme: {
        label: "Theme",
        system: "System",
        light: "Light",
        dark: "Dark",
      },
      ringEffects: {
        label: "Ring effects",
        description:
          "Paw stamps every 10%, a glow in the last minute, and a celebration when focus ends",
      },
      keepScreenOn: {
        label: "Keep screen on",
        description: "Keeps your screen from turning off while the timer runs",
        unsupported: "This browser can’t keep the screen on",
      },
    },
    data: {
      title: "Data",
      resetSettings: {
        label: "Reset settings",
        description: "Restore timer, alert and display settings to defaults",
        button: "Reset",
        confirm: {
          title: "Reset settings?",
          action: "Reset",
          message:
            "Timer, alert and display settings (including theme and language) go back to their defaults. Your tasks and history stay.",
        },
      },
    },
  },
  shortcuts: {
    toggle: "Start / pause",
    reset: "Reset",
    skip: "Next session",
    settings: "Open settings",
  },
  auth: {
    login: {
      title: "Log in",
      intro: "You can keep using every feature without logging in.",
      google: "Continue with Google",
      kakao: "Continue with Kakao",
      redirecting: "Taking you to {provider}…",
      failed: "Couldn’t start logging in. Please try again in a moment.",
      notConfigured: "Logging in isn’t available on this site yet.",
      devAccount: "Log in with the test account (dev only)",
      note: "When you’re logged in, your tasks, history and settings are saved to your account so you can continue on other devices.",
    },
    callback: {
      working: "Logging you in…",
      failed: "Couldn’t log you in. Please try again.",
      retry: "Try again",
    },
    profile: {
      title: "My profile",
      loading: "Loading…",
      signedOut: "You’re not logged in.",
      login: "Log in",
      avatarAlt: "Profile photo of {name}",
      nickname: "Nickname",
      editNickname: "Change nickname",
      nicknameHint:
        "Up to {max} characters. Leave it empty to use your account name.",
      save: "Save",
      saved: "Nickname updated.",
      errors: {
        tooLong: "Nicknames can be up to {max} characters.",
        failed: "Couldn’t save. Please try again in a moment.",
      },
      signedInWith: "Signed in with {provider}",
      providers: {
        google: "Google",
        kakao: "Kakao",
        email: "Email",
      },
      joined: "Joined",
      logout: "Log out",
      logoutTitle: "Log out?",
      logoutNote:
        "Logging out clears your tasks, history and timer in this browser. They stay in your account and come back when you log in again.",
      deleteAccount: {
        button: "Delete account",
        title: "Delete your account?",
        message:
          "Your account and the tasks, history and settings saved to it will be deleted. This can’t be undone. Tasks, history and the timer in this browser will be cleared too.",
        action: "Delete account",
        working: "Deleting…",
        failed: "Couldn’t delete your account. Please try again in a moment.",
      },
    },
  },
};

export default en;
