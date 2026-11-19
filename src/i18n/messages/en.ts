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
      scene: "Kkami walking along a park path",
      error: "Could not load the walk.",
      home: "Go home",
      skip: "Skip",
      skipFirst: "Walk the first one all the way together",
      found: "Found {object}!",
      foundBox: "Added to the item box",
    },
    items: {
      button: "Items",
      newItems: "New items",
      title: "Item box",
      tabs: "Item box view",
      slotTabs: "Place to make for",
      list: "Items",
      craft: "Craft",
      unknown: "???",
      notFound: "Not found yet",
      heartLocked: "Not yet",
      stampLocked: "After a cycle",
      count: "× {count}",
      leaf: { name: "Leaf", object: "a leaf" },
      twig: { name: "Twig", object: "a twig" },
      stone: { name: "Stone", object: "a stone" },
      pinecone: { name: "Pinecone", object: "a pinecone" },
      flower: { name: "Flower", object: "a flower" },
      ball: { name: "Ball", object: "a ball" },
      heart: { name: "Heart" },
      stamp: { name: "Paw stamp" },
      needLabel: "{name}: {have} of {need}",
      make: "Make",
      made: "Made",
      short: "Not enough",
      decorate: "Decorate the room",
      slots: {
        room: { name: "Walls & floor", object: "walls and floor" },
        window: { name: "Window", object: "window" },
        pot: { name: "Plant", object: "plant" },
        rug: { name: "Rug", object: "rug" },
        outfit: { name: "Outfit", object: "outfit" },
        bubble: { name: "Speech bubble", object: "speech bubble" },
      },
      furniture: {
        plainWindow: {
          name: "Plain window",
          object: "a plain window",
          to: "the plain window",
        },
        twigWindow: {
          name: "Twig window",
          object: "a twig window",
          to: "the twig window",
        },
        flowerWindow: {
          name: "Flower box window",
          object: "a flower box window",
          to: "the flower box window",
        },
        stoneWindow: {
          name: "Round stone window",
          object: "a round stone window",
          to: "the round stone window",
        },
        plainPot: {
          name: "Plain pot",
          object: "a plain pot",
          to: "the plain pot",
        },
        flowerPot: {
          name: "Flower pot",
          object: "a flower pot",
          to: "the flower pot",
        },
        pinePot: {
          name: "Little pine",
          object: "a little pine",
          to: "the little pine",
        },
        succulentPot: {
          name: "Stone pot succulent",
          object: "a stone pot succulent",
          to: "the stone pot succulent",
        },
        plainRoom: {
          name: "Plain walls & floor",
          object: "plain walls and floor",
          to: "the plain walls and floor",
        },
        cabinRoom: {
          name: "Log cabin",
          object: "a log cabin room",
          to: "the log cabin room",
        },
        floralRoom: {
          name: "Pastel flowers",
          object: "a pastel flower room",
          to: "the pastel flower room",
        },
        stripeRoom: {
          name: "Classic stripes",
          object: "a classic stripe room",
          to: "the classic stripe room",
        },
        plainRug: {
          name: "Plain rug",
          object: "a plain rug",
          to: "the plain rug",
        },
        braidRug: {
          name: "Braided rug",
          object: "a braided rug",
          to: "the braided rug",
        },
        pinkRug: {
          name: "Pink wavy rug",
          object: "a pink wavy rug",
          to: "the pink wavy rug",
        },
        fringeRug: {
          name: "Blue tassel rug",
          object: "a blue tassel rug",
          to: "the blue tassel rug",
        },
        plainOutfit: {
          name: "Plain collar",
          object: "a plain collar",
          to: "the plain collar",
        },
        brownHat: {
          name: "Brown hat",
          object: "a brown hat",
          to: "the brown hat",
        },
        ginghamBib: {
          name: "Blue gingham scarf",
          object: "a blue gingham scarf",
          to: "the blue gingham scarf",
        },
        creamScarf: {
          name: "Cream scarf",
          object: "a cream scarf",
          to: "the cream scarf",
        },
        checkShirt: {
          name: "Blue check shirt",
          object: "a blue check shirt",
          to: "the blue check shirt",
        },
        coneCollar: {
          name: "Cone collar",
          object: "a cone collar",
          to: "the cone collar",
        },
        plainBubble: {
          name: "Plain bubble",
          object: "a plain bubble",
          to: "the plain bubble",
        },
        gameBubble: {
          name: "Game dialog box",
          object: "a game dialog box",
          to: "the game dialog box",
        },
        cloudBubble: {
          name: "Cloud bubble",
          object: "a cloud bubble",
          to: "the cloud bubble",
        },
        heartBubble: {
          name: "Pink heart bubble",
          object: "a pink heart bubble",
          to: "the pink heart bubble",
        },
        stampBubble: {
          name: "Stamp bubble",
          object: "a stamp bubble",
          to: "the stamp bubble",
        },
      },
    },
    decorate: {
      status: "Decorating",
      prev: "Prev",
      next: "Next",
      choose: "Choose",
      place: "Place",
      done: "Done",
      back: "Back",
      position: "{index} of {total}",
      pick: "Choose the {name}",
    },
    // 까미 말풍선: 친밀도 레벨(lv1~5)별 문장. 낮은 레벨은 강아지 소리만 (I-058)
    speech: {
      idle: {
        lv1: ["Woof?", "Sniff sniff…", "Arf!", "Woof woof"],
        lv2: ["Woof! Bored…", "Arf, hi!", "Woof… play?", "Sniff, smells nice"],
        lv3: [
          "Let’s play!",
          "Take a break with me?",
          "What are you up to?",
          "My tail’s all wiggly",
        ],
        lv4: [
          "Working hard today?",
          "Rest here a little",
          "I heard you coming",
        ],
        lv5: [
          "I love being with you",
          "I was waiting for you!",
          "Thanks for coming today",
        ],
      },
      time: {
        dawn: [
          "You’re up early!",
          "Still a bit sleepy…",
          "The air is so fresh",
        ],
        day: [
          "The sun feels warm",
          "Perfect nap weather",
          "Great day for a walk!",
        ],
        dusk: ["What a pretty sunset", "The sky is orange!", "Evening walk?"],
        night: ["So many stars out", "You did great today", "Getting sleepy…"],
        nightSleepy: ["Yawn…", "Whine…"],
      },
      pat: {
        lv1: ["Woof woof!", "Whine~", "Arf arf!"],
        lv2: ["Woof! I like it!", "Hehe, woof!", "Arf! More!"],
        lv3: ["Hehe, one more!", "Right there!", "That tickles!"],
        lv4: ["Best feeling ever!", "Your hands are warm", "Just a bit more~"],
        lv5: ["You’re the best!", "I love this moment", "Love you, hehe"],
      },
      snack: {
        lv1: ["Nom nom!", "Arf! Arf!", "Sniff… nom!"],
        lv2: ["Nom nom, woof!", "Yumm… arf!", "Woof! More!"],
        lv3: ["Yum, thank you!", "This is tasty!", "Got any more?"],
        lv4: ["My favorite!", "So crunchy!", "I’ll savor it"],
        lv5: ["Tastier from you", "Best treat ever!"],
      },
      wake: {
        lv1: ["Arf?!", "Woof?!", "Whine…?"],
        lv2: ["Woof?! Hi!", "Arf! You’re here!"],
        lv3: ["Oh, you’re here!", "Mmh… you came?"],
        lv4: ["You startled me! Hi", "I dreamed of you"],
        lv5: ["You’re here! Yay!", "I missed you!"],
      },
      home: {
        lv1: ["Arf arf!", "Pant pant… woof!"],
        lv2: ["Woof! That was fun!", "Pant, pant, yay!"],
        lv3: ["We’re back!", "Outside smelled great", "Did you see my find?"],
        lv4: ["Let’s go again!", "My legs are happy"],
        lv5: ["Loved walking together", "Walks with you are best"],
      },
      rest: {
        lv1: ["Woof!", "Arf arf!", "Sniff… woof!"],
        lv2: ["Woof! Break time!", "Arf! Let's play!"],
        lv3: ["Good work!", "Break time!", "Stay and play a bit"],
        lv4: ["Hard work! Let's rest", "Let's have a stretch"],
        lv5: ["Good work! Rest with me", "I'm right here, rest up"],
      },
      decorated: {
        lv1: ["Woof?!", "Sniff… arf!"],
        lv2: ["Woof! Pretty!", "Arf, something new!"],
        lv3: ["The room looks lovely!", "Ooh, new stuff!"],
        lv4: ["I love it here", "Our room is the best"],
        lv5: ["Decorating together!", "This is our room"],
      },
      levelUp: {
        lv2: "Woof… oh, h-hi?!",
        lv3: "I talk well now, right?",
        lv4: "We’re real friends now!",
        lv5: "You’re my best friend!",
      },
      sleep: "Zzz…",
    },
    panel: { collapse: "Collapse", expand: "Expand" },
    log: {
      title: "Log",
      more: "Show {count} more",
      less: "Show less",
      enter: "Came to see Kkami",
      wake: "Kkami woke up",
      pat: "Gave pats",
      patTotal: "{count} in total",
      snack: "Gave a treat",
      walkOut: "Went for a walk",
      found: "Found {object}",
      home: "Back home",
      skipped: "Skipped the walk and brought back {object}",
      levelHeart: "Level {level}! Got a heart",
      stamp: "Cycle done! Got a paw stamp",
      craft: "Made {object}",
      place: "Changed the {slot} to {to}",
      walkLimit: "That’s all {count} walks for today. More tomorrow!",
      snackLimit: "That’s all {count} treats for today. More tomorrow!",
    },
    affinity: {
      title: "Affinity",
      level: "Lv.{level}",
      loading: "Loading",
      progress: "Bond level {level}, {points} points",
      nextStage: "Next: {name}",
      maxStage: "Top level",
      points: "{points} / {next} pts",
      left: "{count} to go",
      max: "MAX · {points} pts",
      todayTitle: "Today's pat bonus",
      todayRule: "First {count} pats a day · +{points} each",
      todayDone: "All earned today",
      todayLeft: "+{earned} / {max}",
      snackHint: "Up to {count} treats a day · +{points} each",
      levelUpHeart: "Level {level}! Heart +1",
      maxBadge: "MAX",
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

    label: "Kkami’s little room",
    name: "Kkami",
    idle: "Relaxed",
    sleeping: "Sleeping",
    wake: "Gently wake Kkami",
    wakeLabel: "Wake Kkami",
    happy: "Happy",
    pet: "Give a little pat",
    feed: "Give a treat",
    snackHappy: "Yummy",
    petLabel: "Pet Kkami",
    keyboard: "With a keyboard, focus the button and press Enter or Space.",
    loading: "Loading…",
    error: "Couldn’t load Kkami.",
    retry: "Try again",
    breakTimer: "{mode} · {time} left",
    breakPaused: "{mode} paused · {time} left",
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
      pet: "Pet",
    },
    menu: {
      label: "Menu",
      darkMode: "Dark mode",
      language: "Language",
      settings: "Settings",
      guide: "How to use",
      login: "Log in",
      profile: "My profile: {name}",
      admin: "Admin",
    },
    /** Legal links in the footer and on the login screen */
    legal: {
      privacy: "Privacy",
      terms: "Terms",
    },
  },
  admin: {
    title: "Admin",
    loading: "Loading…",
    notAllowed: "Only admins can see this page.",
    failed: "Couldn’t load. Please try again in a moment.",
    retry: "Try again",
    stats: {
      title: "Overview",
      total: "Members",
      vip: "VIP",
      newUsers: "New in 7 days",
      activeUsers: "Focused in 7 days",
      focusSessions: "Focus sessions in 7 days",
    },
    users: {
      title: "{count, plural, one {# member} other {# members}}",
      search: "Search nickname or email",
      empty: "No members found.",
      noName: "(No name)",
      joined: "Joined {date}",
      lastSignIn: "Last sign-in {date}",
      focus: "{count, plural, one {# focus} other {# focus sessions}}",
      vipLabel: "VIP for {name}",
      saveFailed: "Couldn’t change VIP. Please try again in a moment.",
    },
  },
  notFound: {
    title: "Kkami got lost",
    message: "We couldn’t find this page. Please check the address.",
    home: "Back to the timer",
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
      stamp: "Paw stamp +1",
    },
    breakSnack: {
      short: "Short break! Play with Kkami?",
      long: "Long break! Walk with Kkami?",
      go: "Go see",
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
      stream: { label: "Stream", description: "Gently flowing water" },
      airplane: { label: "Airplane cabin", description: "Low engine hum" },
      library: { label: "Library", description: "Quiet between the shelves" },
      cafe: { label: "Café", description: "Soft chatter and coffee" },
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
    expand: "View full screen",
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
      kakao:
        "Saving isn’t available in KakaoTalk’s browser. Open it full screen and take a screenshot.",
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
      /** When there are no tasks or they are hidden */
      tasksHidden: "One more step forward today",
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
      google: "Continue with Google",
      kakao: "Continue with Kakao",
      redirecting: "Taking you to {provider}…",
      failed: "Couldn’t start logging in. Please try again in a moment.",
      notConfigured: "Logging in isn’t available on this site yet.",
      devAccount: "Log in with the test account (dev only)",
      note: "When you’re logged in, your tasks, history and settings are saved to your account so you can continue on other devices.",
      agreement:
        "By logging in, you agree to the <terms>Terms of Service</terms>.",
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
      vip: "VIP",
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
        "Logging out clears your tasks, history, timer and Kkami in this browser. They stay in your account and come back when you log in again.",
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
