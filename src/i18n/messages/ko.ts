/**
 * 화면 문구 사전 (한국어, 기준). 다른 언어(en.ts)는 이 파일과 같은 모양이어야 합니다.
 * 기능별로 묶었고, 화면에서는 useTranslations("묶음")으로 읽습니다.
 * 값을 넣는 자리는 {이름}, 개수에 따라 말이 바뀌면 {count, plural, ...} (ICU 메시지 형식).
 * 사용법·첫 방문 안내의 긴 글은 src/features/guide/content.ko.ts에 따로 있습니다.
 */
const ko = {
  pet: {
    walk: {
      start: "산책하기",
      status: "산책 중",
      return: "돌아가기",
      scene: "산책길을 걷는 까미",
      error: "산책길을 불러오지 못했어요.",
    },
    affinity: {
      label: "친밀도",
      level: "친밀도 Lv.{level}",
      loading: "불러오는 중",
      progress: "친밀도 {level}단계, {points}점",
      points: "{points} / {next}점",
      max: "최고 단계 · {points}점",
      today: "오늘 쓰담 +{earned} / {max}",
      snackHint: "간식은 줄 때마다 +{points}",
      hint: "하루 첫 {count}번 쓰담에 +{points}씩. 친밀도는 줄지 않아요.",
      levelUp: "까미와 더 가까워졌어요 · Lv.{level}",
      stages: {
        "1": "알아가는 사이",
        "2": "익숙한 사이",
        "3": "친한 친구",
        "4": "소중한 친구",
        "5": "단짝",
      },
    },
    storageIssue: {
      load: "기록을 불러오지 못했어요.",
      save: "기록을 저장하지 못했어요.",
      invalid: "저장된 기록을 읽을 수 없어요.",
      newer: "새로고침 후 다시 시도해 주세요.",
    },
    retrySave: "재시도",
    startled: "깜짝!",
    startleBubble: "앗, 왔구나!",

    back: "타이머",
    label: "까미의 작은 방",
    name: "까미",
    idle: "편안해요",
    sleeping: "자는 중",
    sleepBubble: "쿨쿨…",
    wake: "살며시 깨우기",
    wakeLabel: "까미 깨우기",
    happy: "행복해요",
    bubble: "나랑 잠깐 쉬어갈래?",
    happyBubble: "헤헤, 한 번 더!",
    pet: "쓰다듬기",
    feed: "간식 주기",
    snackHappy: "맛있어요",
    snackBubble: "냠냠, 고마워!",
    petLabel: "까미 쓰다듬기",
    keyboard: "키보드로는 버튼에 초점을 맞추고 Enter 또는 Space를 눌러요.",
    count: "누적 쓰담",
    loading: "불러오는 중…",
    error: "까미를 불러오지 못했어요.",
    retry: "다시 불러오기",
    reset: "다시 깨워보기",
    roomLabel: "까미의 방",
    patCount: "{count}번",
  },
  common: {
    cancel: "취소",
    close: "닫기",
    decrease: "{label} 줄이기",
    increase: "{label} 늘리기",
    opensInNewTab: "(새 탭에서 열림)",
    today: "오늘",
    noRecords: "기록 없음",
    volume: "소리 크기",
  },
  app: {
    name: "까모도로",
    nav: {
      label: "페이지",
      timer: "타이머",
      calendar: "캘린더",
    },
    menu: {
      label: "메뉴",
      darkMode: "다크 모드",
      language: "언어",
      settings: "설정",
      guide: "사용법",
      login: "로그인",
      profile: "내 프로필: {name}",
    },
    /** 푸터·로그인 화면의 약관 링크 */
    legal: {
      privacy: "개인정보처리방침",
      terms: "이용약관",
    },
  },
  /** 없는 주소 (404) */
  notFound: {
    title: "까미가 길을 잃었어요",
    message: "찾는 페이지가 없어요. 주소를 다시 확인해 주세요.",
    home: "타이머로 돌아가기",
  },
  /** 까미 사진 설명 (화면 낭독기) */
  kkami: {
    default: "정면을 바라보며 기다리는 까미",
    done: "웃고 있는 까미",
    focus: "곁에서 조용히 엎드려 있는 까미",
    "short-break": "산책 가는 까미",
    "long-break": "신이 난 까미",
  },
  timer: {
    label: "타이머",
    currentTask: "지금 할 일",
    modeLabel: "타이머 모드",
    modes: {
      focus: "집중",
      "short-break": "짧은 휴식",
      "long-break": "긴 휴식",
    },
    cycle: {
      longBreakNow: "긴 휴식 시간이에요",
      nextIsLong: "이번 휴식은 긴 휴식이에요",
      untilLongBreak: "긴 휴식까지 {count}번 남았어요",
      progress: "이번 사이클 집중 {done}번 완료, 전체 {total}번",
    },
    status: {
      paused: "잠시 멈췄어요",
      focus: {
        running: "집중하고 있어요",
        idle: "집중할 준비가 됐나요?",
      },
      "short-break": {
        running: "까미랑 짧은 산책 중이에요",
        idle: "까미랑 짧은 산책할 시간이에요",
      },
      "long-break": {
        running: "까미랑 긴 산책 중이에요",
        idle: "까미랑 긴 산책할 시간이에요",
      },
    },
    controls: {
      start: "시작",
      pause: "일시정지",
      resume: "다시 시작",
      reset: "리셋",
      skip: "다음 세션",
      confirm: {
        reset: {
          title: "집중을 처음부터 할까요?",
          action: "리셋",
          message: "지금 집중 세션은 완료로 세지 않고 처음 시간으로 돌아가요.",
        },
        skip: {
          title: "집중을 건너뛸까요?",
          action: "건너뛰기",
          message: "지금 집중 세션은 완료로 세지 않고 바로 휴식으로 넘어가요.",
        },
      },
    },
    switchMode: {
      title: {
        focus: "집중으로 바꿀까요?",
        "short-break": "짧은 휴식으로 바꿀까요?",
        "long-break": "긴 휴식으로 바꿀까요?",
      },
      confirm: "바꾸기",
      message:
        "지금 {mode} 세션이 진행 중이에요. 바꾸면 이 세션은 완료로 세지 않아요.",
    },
    completion: {
      cycle: {
        title: "한 사이클 완료!",
        message:
          "집중 {count}번을 모두 마쳤어요. 까미랑 {walk, select, long {긴} other {짧은}} 산책 다녀와요.",
      },
      focus: {
        title: "수고했어요!",
        message:
          "뽀모도로 하나를 완료했어요. 까미랑 {walk, select, long {긴} other {짧은}} 산책 다녀와요.",
      },
      break: {
        title: "휴식 끝!",
        message: "까미가 기다리고 있어요. 다시 집중해볼까요?",
      },
      startNow: "지금 시작",
      later: "나중에",
      startNext: "{mode} 시작 →",
      autoStart: "{seconds}초 후 {mode} 시작",
    },
    testMode: {
      badge: "테스트 모드 · {seconds}초",
      off: "끄기",
    },
  },
  tasks: {
    title: "할 일",
    remaining: "{count}개 남음",
    clearDone: {
      label: "완료한 할 일 정리",
      hint: "목록에서 숨겨요. 캘린더에는 남아요",
    },
    add: "추가",
    save: "저장",
    placeholder: "무엇에 집중할까요?",
    empty: {
      title: "할 일을 추가하고 집중해보세요.",
      hint: "집중을 마칠 때마다 선택한 할 일에 <paw></paw> 발자국이 쌓여요.",
    },
    estimate: {
      label: "예상 뽀모도로 수",
    },
    active: "집중 중",
    select: {
      label: "{title}에 집중하기",
      button: "선택",
    },
    edit: "{title} 수정",
    delete: "{title} 삭제",
    pawCount: {
      label: "뽀모도로 {done}개 완료, 예상 {estimate}개",
      title: "완료 {done}번 · 예상 {estimate}번",
    },
    doneCheck: {
      reachedEstimate: "예상한 {count}번을 모두 채웠어요!",
      label: "이 할 일을 다 끝냈어요",
      next: "다음 할 일: {title}",
      noneLeft: "남은 할 일이 없어요. 새 할 일을 추가해보세요.",
    },
    /** 끌어서 순서 바꾸기 (화면 낭독기 안내 포함) */
    sort: {
      roleDescription: "순서를 바꿀 수 있는 할 일",
      handle: "{title} 순서 바꾸기",
      handleHint: "끌어서 순서 바꾸기",
      instructions:
        "순서를 바꾸려면 스페이스나 엔터를 누른 뒤 위아래 화살표로 옮기고, 다시 스페이스나 엔터를 눌러 내려놓으세요. ESC를 누르면 취소합니다.",
      pickedUp:
        '"{title}"을 들었습니다. {total}개 중 {position}번째 자리입니다.',
      movedTo: "{total}개 중 {position}번째 자리입니다.",
      dropped: '"{title}"을 {total}개 중 {position}번째 자리에 놓았습니다.',
      droppedInPlace: '"{title}"을 제자리에 놓았습니다.',
      cancelled: '옮기기를 취소했습니다. "{title}"은 제자리로 돌아갔습니다.',
    },
  },
  history: {
    today: "오늘 {count}개 · {minutes}분",
  },
  focusSound: {
    title: "집중 소리",
    buttonPlaying: "집중 소리: {sound}",
    buttonRandom: "집중 소리: 랜덤 ({sound})",
    hint: "집중할 때만 들려요.",
    hintWithPreview: "집중할 때만 들려요. 고르면 미리 들려줘요.",
    kind: "소리 종류",
    off: {
      label: "끄기",
      description: "소리 없이 집중",
    },
    random: {
      label: "랜덤",
      description: "집중마다 다른 소리",
      now: "이번 집중: {sound}",
      next: "다음 집중: {sound}",
    },
    groups: {
      noise: "노이즈",
      nature: "자연의 소리",
      places: "공간의 소리",
    },
    sounds: {
      white: { label: "백색소음", description: "고른 치이익" },
      pink: { label: "핑크 노이즈", description: "부드러운 쏴아" },
      brown: { label: "브라운 노이즈", description: "묵직한 웅웅" },
      rain: { label: "빗소리", description: "쏴아 내리는 비" },
      "window-rain": { label: "창가 빗소리", description: "유리창에 톡톡" },
      fireplace: { label: "모닥불", description: "타닥타닥 장작" },
      forest: { label: "숲속", description: "새소리와 나뭇잎" },
      waves: { label: "파도", description: "잔잔한 바다" },
      airplane: { label: "비행기 기내", description: "낮게 울리는 엔진" },
    },
    playing: "(재생 중)",
  },
  /** 세션이 끝날 때 브라우저 알림 */
  alerts: {
    "focus-end": {
      title: "집중 끝! 🐾",
      body: "수고했어요. 까미랑 짧은 산책 다녀와요.",
    },
    "cycle-done": {
      title: "한 사이클 완료! 🏅",
      body: "집중을 모두 마쳤어요. 까미랑 긴 산책 다녀와요.",
    },
    "break-end": {
      title: "휴식 끝!",
      body: "까미가 기다리고 있어요. 다시 집중해볼까요?",
    },
  },
  calendar: {
    monthSummary: "집중 {focusCount}번 · 사이클 {cycles}개",
    prevMonth: "이전 달",
    nextMonth: "다음 달",
    legend: {
      less: "적게",
      more: "많이",
      cycle: "사이클 완료",
    },
    /** 달력 칸 (화면 낭독기) */
    cell: {
      focusCount: "집중 {count}번",
      cycleCount: "사이클 {count}개",
    },
    day: {
      future: "아직 오지 않은 날이에요.",
      empty: "이날은 기록이 없어요. 까미도 푹 쉬었어요.",
      focus: "집중",
      focusCount: "{count}번",
      focusTime: "집중한 시간",
      cycles: "사이클",
      cycleCount: "{count}개",
      certificate: "제 {number}호 수료증",
      completed: {
        title: "완료한 할 일",
        empty: "이날 완료한 할 일이 없어요.",
      },
      inProgress: {
        title: "진행 중이던 할 일",
        empty: "이날 집중한 할 일은 모두 끝냈어요.",
      },
      taskFocusCount: "이날 집중 {count}번",
    },
  },
  stats: {
    title: "통계",
    empty: "첫 집중을 마치면 여기에 기록이 쌓여요.",
    streak: {
      title: "연속",
      days: "{count}일",
      best: "최고 {count}일",
      keepGoing: "오늘 집중하면 {count}일째",
    },
    week: {
      title: "최근 7일",
      same: "그 전 7일과 같아요",
      diff: "그 전 7일보다 <nowrap>{diff}</nowrap>",
    },
    month: {
      title: "이번 달",
    },
    cycles: "사이클 {count}개",
    all: {
      title: "전체",
      focusCount: "집중 {count}번",
    },
    chart: {
      title: "최근 7일 집중 시간 (분)",
    },
  },
  certificate: {
    title: "까모도로 수료증",
    make: "수료증 만들기",
    todayButton: "오늘 {count}사이클 완료, 수료증 만들기",
    save: "이미지 저장",
    expand: "크게 보기",
    share: "공유하기",
    preview: "{title} 미리보기",
    status: {
      failed: "수료증을 만들지 못했어요. 다시 열어 주세요.",
      making: "수료증을 만드는 중…",
      noCycle: "아직 완료한 사이클이 없어요.",
    },
    hint: {
      shareFailed: "공유하지 못했어요. 이미지를 저장해서 올려 주세요.",
      share: "공유하기에서 인스타그램을 고르면 스토리에 올릴 수 있어요.",
      kakao:
        "카카오톡에서는 이미지를 저장할 수 없어요. 크게 보기로 열어 스크린샷을 찍어 주세요.",
    },
    showTasks: {
      label: "할 일 보이기",
      description: "이번 사이클에 한 할 일을 수료증에 넣어요",
    },
    /** 수료증 본문 두 줄 */
    message: {
      withLength: "{length} 집중을 {count}번 해내었기에",
      withoutLength: "집중을 {count}번 해내었기에",
      award: "이 수료증을 드립니다.",
    },
    /** 수료증 이미지에 그리는 글 */
    image: {
      header: "한 사이클 완료!",
      badge: "제 {number}호 · {date}",
      focusTime: "집중한 시간",
      pomodoros: "뽀모도로",
      pomodoroCount: "{count}번",
      cycleCount: "{count}사이클",
      doneToday: "오늘 완료",
      doneThatDay: "이날 완료",
      tasks: "이번 사이클에 한 일",
      moreTasks: "그 밖에 {count}개",
      /** 할 일이 없거나 숨겼을 때 */
      tasksHidden: "오늘도 한 걸음 성장했어요",
      stamp: "까미 인증",
    },
  },
  settings: {
    title: "설정",
    shortcuts: "단축키",
    timer: {
      title: "타이머",
      minutes: "{value}분",
      /** 모드별 시간 조절 (줄 이름은 timer.modes) */
      length: {
        focus: "집중 시간",
        "short-break": "짧은 휴식 시간",
        "long-break": "긴 휴식 시간",
      },
      interval: {
        label: "긴 휴식 주기",
        description: "집중을 {count}번 마치면 긴 휴식",
        value: "{value}회",
      },
      autoStartBreaks: {
        label: "휴식 자동 시작",
        description: "집중이 끝나면 휴식을 바로 시작해요",
      },
      autoStartFocus: {
        label: "집중 자동 시작",
        description: "휴식이 끝나면 다음 집중을 바로 시작해요",
      },
      testMode: "테스트 모드가 켜져 있어서 모든 세션이 {seconds}초로 진행돼요.",
      appliesNext: "바꾼 시간은 지금 세션이 끝난 뒤 다음 세션부터 적용돼요.",
    },
    alerts: {
      title: "알림",
      sound: {
        label: "알림 소리",
        description: "세션이 끝나면 종소리로 알려줘요",
      },
      preview: "미리 듣기",
      notifications: {
        label: "브라우저 알림",
        available: "다른 탭에 있을 때 세션이 끝나면 알려줘요",
        denied:
          "브라우저에서 알림이 차단돼 있어요. 주소창 왼쪽의 사이트 설정에서 허용해 주세요",
        unsupported: "이 브라우저는 알림을 지원하지 않아요",
      },
    },
    display: {
      title: "화면",
      language: "언어",
      theme: {
        label: "테마",
        system: "기기 설정",
        light: "라이트",
        dark: "다크",
      },
      ringEffects: {
        label: "띠 효과",
        description: "10%마다 발자국 도장, 마지막 1분 빛, 집중 완료 축하",
      },
      keepScreenOn: {
        label: "화면 켜두기",
        description: "타이머가 도는 동안 화면이 꺼지지 않게 해요",
        unsupported: "이 브라우저는 화면 켜두기를 지원하지 않아요",
      },
    },
    data: {
      title: "데이터",
      resetSettings: {
        label: "설정 되돌리기",
        description: "시간, 알림, 화면 설정을 처음 값으로",
        button: "되돌리기",
        confirm: {
          title: "설정을 되돌릴까요?",
          action: "되돌리기",
          message:
            "시간, 알림, 화면(테마, 언어 포함) 설정이 처음 값으로 돌아가요. 할 일과 기록은 그대로예요.",
        },
      },
    },
  },
  /** 단축키가 하는 일 */
  shortcuts: {
    toggle: "시작 / 일시정지",
    reset: "리셋",
    skip: "다음 세션",
    settings: "설정 열기",
  },
  /** 로그인 (Supabase Auth) */
  auth: {
    login: {
      title: "로그인",
      google: "Google 계정으로 로그인",
      kakao: "카카오 로그인",
      redirecting: "{provider}로 이동하는 중…",
      failed: "로그인을 시작하지 못했어요. 잠시 뒤 다시 해 주세요.",
      notConfigured: "이 사이트에서는 아직 로그인을 쓸 수 없어요.",
      devAccount: "테스트 계정으로 로그인 (개발용)",
      note: "로그인하면 할 일, 기록, 설정이 계정에 저장돼서 다른 기기에서도 이어 쓸 수 있어요.",
      agreement: "로그인하면 <terms>이용약관</terms>에 동의하게 돼요.",
    },
    callback: {
      working: "로그인하는 중…",
      failed: "로그인하지 못했어요. 다시 해 주세요.",
      retry: "다시 로그인",
    },
    profile: {
      title: "내 프로필",
      loading: "불러오는 중…",
      signedOut: "로그인하지 않았어요.",
      login: "로그인하기",
      avatarAlt: "{name}의 프로필 사진",
      nickname: "닉네임",
      editNickname: "닉네임 바꾸기",
      nicknameHint: "{max}자까지. 비우면 로그인한 계정의 이름을 써요.",
      save: "저장",
      saved: "닉네임을 바꿨어요.",
      errors: {
        tooLong: "{max}자까지 쓸 수 있어요.",
        failed: "저장하지 못했어요. 잠시 뒤 다시 해 주세요.",
      },
      signedInWith: "{provider}로 로그인",
      providers: {
        google: "Google",
        kakao: "카카오",
        email: "이메일",
      },
      joined: "가입한 날",
      logout: "로그아웃",
      logoutTitle: "로그아웃할까요?",
      logoutNote:
        "로그아웃하면 이 브라우저의 할 일, 기록, 타이머가 지워져요. 계정에는 그대로 남아 있어서 다시 로그인하면 돌아와요.",
      deleteAccount: {
        button: "회원 탈퇴",
        title: "회원 탈퇴할까요?",
        message:
          "계정과 계정에 저장된 할 일, 기록, 설정이 모두 지워지고 되돌릴 수 없어요. 이 브라우저의 할 일, 기록, 타이머도 지워져요.",
        action: "탈퇴하기",
        working: "탈퇴하는 중…",
        failed: "탈퇴하지 못했어요. 잠시 뒤 다시 해 주세요.",
      },
    },
  },
};

export type Messages = typeof ko;
export default ko;
