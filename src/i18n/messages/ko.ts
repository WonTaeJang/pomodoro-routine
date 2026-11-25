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
      scene: "산책길을 걷는 까미",
      error: "산책길을 불러오지 못했어요.",
      home: "집으로",
      skip: "건너뛰기",
      skipFirst: "첫 산책은 끝까지 함께 걸어요",
      found: "{object} 주웠어요!",
      foundBox: "아이템 상자에 넣었어요",
    },
    items: {
      button: "아이템",
      newItems: "새 아이템이 있어요",
      title: "아이템 상자",
      tabs: "아이템 상자 보기",
      slotTabs: "꾸밀 자리",
      tab: { materials: "재료", decor: "꾸미기", sets: "세트" },
      unknown: "???",
      notFound: "아직 못 찾음",
      heartLocked: "아직 못 받음",
      stampLocked: "사이클 완료 시",
      giftName: "VIP 선물 상자",
      guide: {
        button: "얻는 방법",
        title: "얻는 방법",
        intro:
          "산책에서는 다녀올 때마다 아이템 하나를 주워요. 퍼센트는 그 아이템이 나올 확률이에요.",
        walk: "산책할 때마다 하나 · {chance, select, often {자주} sometimes {가끔} other {드물게}} ({percent}%)",
        heart: "친밀도 레벨이 오를 때마다 1개",
        stamp: "집중 사이클을 마칠 때마다 1개",
        gift: "하루 한 번 · 산책 재료 {kinds}가지를 {count}개씩",
        snow: "11~2월 · 하루 한 번 눈송이 {count}개",
      },
      count: "× {count}",
      leaf: { name: "나뭇잎", object: "나뭇잎을" },
      twig: { name: "나뭇가지", object: "나뭇가지를" },
      stone: { name: "돌멩이", object: "돌멩이를" },
      pinecone: { name: "솔방울", object: "솔방울을" },
      flower: { name: "꽃", object: "꽃을" },
      ball: { name: "공", object: "공을" },
      heart: { name: "하트" },
      stamp: { name: "발바닥 도장" },
      snow: { name: "눈송이" },
      // 눈송이와 크리스마스 꾸미기에 붙는 시즌 표시 (I-074)
      season: "11~2월 한정",
      needLabel: "{name} {have}개 있음, {need}개 필요",
      make: "만들기",
      apply: "적용",
      applied: "적용 중",
      starter: "기본 제공",
      vip: "VIP",
      // 세트 탭 (I-069)
      setMade: "{total}개 중 {count}개 만듦",
      setMissing: "{name}, 아직 안 만듦",
      setEdition: {
        palace: "다 놓으면 게임기가 궁전 에디션으로 바뀌어요",
        stage: "다 놓으면 게임기가 VIP 에디션으로 바뀌어요",
      },
      sets: {
        // intro: 카드 아래 한 줄 소개
        cabin: {
          name: "숲속 오두막 세트",
          to: "숲속 오두막 세트로",
          intro: "나무 냄새 나는 아늑한 오두막",
        },
        floral: {
          name: "파스텔 꽃 세트",
          to: "파스텔 꽃 세트로",
          intro: "꽃이 가득한 봄날의 방",
        },
        stripe: {
          name: "줄무늬 클래식 세트",
          to: "줄무늬 클래식 세트로",
          intro: "단정하고 차분한 클래식 방",
        },
        palace: {
          name: "궁전 세트",
          to: "궁전 세트로",
          intro: "금빛으로 빛나는 궁전의 방",
        },
        christmas: {
          name: "크리스마스 세트",
          to: "크리스마스 세트로",
          intro: "트리 불빛이 반짝이는 크리스마스 방",
        },
        stage: {
          name: "아이돌 무대 세트",
          to: "아이돌 무대 세트로",
          intro: "조명이 켜진 반짝이는 무대",
        },
      },
      short: "재료 부족",
      decorate: "방 꾸미기",
      slots: {
        room: { name: "벽·바닥", object: "벽·바닥을" },
        window: { name: "창문", object: "창문을" },
        pot: { name: "화분", object: "화분을" },
        rug: { name: "카펫", object: "카펫을" },
        outfit: { name: "옷", object: "옷을" },
        bubble: { name: "말풍선", object: "말풍선을" },
      },
      furniture: {
        plainWindow: {
          name: "기본 창",
          object: "기본 창을",
          to: "기본 창으로",
        },
        twigWindow: {
          name: "나뭇가지 창틀",
          object: "나뭇가지 창틀을",
          to: "나뭇가지 창틀로",
        },
        flowerWindow: {
          name: "꽃 장식 창",
          object: "꽃 장식 창을",
          to: "꽃 장식 창으로",
        },
        stoneWindow: {
          name: "둥근 돌 창",
          object: "둥근 돌 창을",
          to: "둥근 돌 창으로",
        },
        palaceWindow: {
          name: "금테 아치 창",
          object: "금테 아치 창을",
          to: "금테 아치 창으로",
        },
        plainPot: {
          name: "기본 화분",
          object: "기본 화분을",
          to: "기본 화분으로",
        },
        flowerPot: { name: "꽃 화분", object: "꽃 화분을", to: "꽃 화분으로" },
        pinePot: {
          name: "작은 소나무",
          object: "작은 소나무를",
          to: "작은 소나무로",
        },
        succulentPot: {
          name: "돌 화분 다육이",
          object: "돌 화분 다육이를",
          to: "돌 화분 다육이로",
        },
        palacePot: {
          name: "금빛 장미 화분",
          object: "금빛 장미 화분을",
          to: "금빛 장미 화분으로",
        },
        plainRoom: {
          name: "기본 벽·바닥",
          object: "기본 벽·바닥을",
          to: "기본 벽·바닥으로",
        },
        cabinRoom: {
          name: "나무 오두막",
          object: "나무 오두막을",
          to: "나무 오두막으로",
        },
        floralRoom: {
          name: "파스텔 꽃무늬",
          object: "파스텔 꽃무늬를",
          to: "파스텔 꽃무늬로",
        },
        stripeRoom: {
          name: "줄무늬 클래식",
          object: "줄무늬 클래식을",
          to: "줄무늬 클래식으로",
        },
        palaceRoom: {
          name: "궁전 방",
          object: "궁전 방을",
          to: "궁전 방으로",
        },
        plainRug: {
          name: "기본 러그",
          object: "기본 러그를",
          to: "기본 러그로",
        },
        braidRug: {
          name: "꼬임 러그",
          object: "꼬임 러그를",
          to: "꼬임 러그로",
        },
        pinkRug: {
          name: "분홍 물결 러그",
          object: "분홍 물결 러그를",
          to: "분홍 물결 러그로",
        },
        fringeRug: {
          name: "술 달린 푸른 러그",
          object: "술 달린 푸른 러그를",
          to: "술 달린 푸른 러그로",
        },
        palaceRug: {
          name: "페르시안 러그",
          object: "페르시안 러그를",
          to: "페르시안 러그로",
        },
        plainOutfit: {
          name: "기본 목줄",
          object: "기본 목줄을",
          to: "기본 목줄로",
        },
        brownHat: {
          name: "갈색 모자",
          object: "갈색 모자를",
          to: "갈색 모자로",
        },
        ginghamBib: {
          name: "파란 깅엄 스카프",
          object: "파란 깅엄 스카프를",
          to: "파란 깅엄 스카프로",
        },
        creamScarf: {
          name: "크림 스카프",
          object: "크림 스카프를",
          to: "크림 스카프로",
        },
        checkShirt: {
          name: "하늘색 체크 셔츠",
          object: "하늘색 체크 셔츠를",
          to: "하늘색 체크 셔츠로",
        },
        coneCollar: { name: "넥카라", object: "넥카라를", to: "넥카라로" },
        stageRoom: {
          name: "아이돌 무대",
          object: "아이돌 무대를",
          to: "아이돌 무대로",
        },
        lightstickWindow: {
          name: "응원봉 객석",
          object: "응원봉 객석을",
          to: "응원봉 객석으로",
        },
        standMicPot: {
          name: "스탠드 마이크",
          object: "스탠드 마이크를",
          to: "스탠드 마이크로",
        },
        centerStageRug: {
          name: "센터 스테이지",
          object: "센터 스테이지를",
          to: "센터 스테이지로",
        },
        christmasRoom: {
          name: "크리스마스 벽지",
          object: "크리스마스 벽지를",
          to: "크리스마스 벽지로",
        },
        christmasWindow: {
          name: "반짝이 전구 창문",
          object: "반짝이 전구 창문을",
          to: "반짝이 전구 창문으로",
        },
        christmasTree: {
          name: "크리스마스트리",
          object: "크리스마스트리를",
          to: "크리스마스트리로",
        },
        santaRug: {
          name: "산타 러그",
          object: "산타 러그를",
          to: "산타 러그로",
        },
        santaSuit: {
          name: "산타 옷",
          object: "산타 옷을",
          to: "산타 옷으로",
        },
        christmasBubble: {
          name: "크리스마스 말풍선",
          object: "크리스마스 말풍선을",
          to: "크리스마스 말풍선으로",
        },
        cheerBubble: {
          name: "응원 피켓 말풍선",
          object: "응원 피켓 말풍선을",
          to: "응원 피켓 말풍선으로",
        },
        plainBubble: {
          name: "기본 말풍선",
          object: "기본 말풍선을",
          to: "기본 말풍선으로",
        },
        gameBubble: {
          name: "게임 대화창",
          object: "게임 대화창을",
          to: "게임 대화창으로",
        },
        cloudBubble: {
          name: "뭉게구름 말풍선",
          object: "뭉게구름 말풍선을",
          to: "뭉게구름 말풍선으로",
        },
        heartBubble: {
          name: "분홍 하트 말풍선",
          object: "분홍 하트 말풍선을",
          to: "분홍 하트 말풍선으로",
        },
        stampBubble: {
          name: "우표 말풍선",
          object: "우표 말풍선을",
          to: "우표 말풍선으로",
        },
      },
    },
    decorate: {
      status: "꾸미는 중",
      prev: "이전",
      next: "다음",
      choose: "고르기",
      place: "놓기",
      done: "끝내기",
      back: "뒤로",
      position: "{total}개 중 {index}번째",
      pick: "{name} 고르기",
    },
    // 까미 말풍선: 친밀도 레벨(lv1~5)별 문장. 낮은 레벨은 강아지 소리만 (I-058)
    speech: {
      idle: {
        lv1: ["멍?", "킁킁…", "왈!", "멍멍"],
        lv2: ["멍! 심심…", "왈, 안녕!", "멍… 놀자?", "킁킁, 좋은 냄새"],
        lv3: [
          "같이 놀자!",
          "나랑 잠깐 쉬어갈래?",
          "뭐 하고 있어?",
          "꼬리가 근질근질해",
        ],
        lv4: ["오늘도 열심히 했어?", "잠깐 쉬었다 가", "너 오는 소리 들었어"],
        lv5: ["너랑 있으면 좋아", "기다리고 있었어!", "오늘도 와 줘서 고마워"],
      },
      time: {
        dawn: ["일찍 일어났네!", "아직 좀 졸려…", "새벽 공기 시원해"],
        day: ["햇볕이 따뜻해", "낮잠 자기 딱 좋다", "산책하기 좋은 날!"],
        dusk: ["노을 예쁘다", "하늘이 주황색이야", "저녁 산책 갈까?"],
        night: ["별이 많이 떴어", "오늘 하루 고생했어", "슬슬 졸리다…"],
        nightSleepy: ["하암…", "끼잉…"],
      },
      pat: {
        lv1: ["멍멍!", "끼잉~", "왈왈!"],
        lv2: ["멍멍! 좋아!", "헤헤, 멍!", "왈! 또!"],
        lv3: ["헤헤, 한 번 더!", "거기 좋아!", "간지러워!"],
        lv4: ["기분 최고야!", "손이 따뜻해", "조금만 더~"],
        lv5: ["역시 네가 최고야!", "이 순간이 제일 좋아", "사랑해, 헤헤"],
      },
      snack: {
        lv1: ["냠냠!", "왈! 왈!", "킁킁… 냠!"],
        lv2: ["냠냠, 멍!", "맛있… 왈!", "멍! 또 줘!"],
        lv3: ["냠냠, 고마워!", "이거 맛있다!", "또 있어?"],
        lv4: ["이거 제일 좋아!", "바삭바삭해!", "아껴 먹을게"],
        lv5: ["네가 주니까 더 맛있어", "최고의 간식이야!"],
      },
      wake: {
        lv1: ["왈?!", "멍?!", "끼잉…?"],
        lv2: ["멍?! 안녕!", "왈! 왔다!"],
        lv3: ["앗, 왔구나!", "음냐… 왔어?"],
        lv4: ["깜짝이야! 반가워", "꿈에서 너 봤어"],
        lv5: ["왔다! 기다렸어!", "보고 싶었어!"],
      },
      home: {
        lv1: ["왈왈!", "헥헥… 멍!"],
        lv2: ["멍! 재밌었어!", "헥헥, 좋아!"],
        lv3: ["다녀왔다!", "바깥 냄새 좋았어", "내가 찾은 거 봤어?"],
        lv4: ["또 가고 싶어!", "다리가 신났어"],
        lv5: ["같이 걸어서 좋았어", "너랑 걷는 게 제일 좋아"],
      },
      rest: {
        lv1: ["멍!", "왈왈!", "킁킁… 멍!"],
        lv2: ["멍! 쉬는 시간!", "왈! 놀자!"],
        lv3: ["수고했어!", "쉬는 시간이다!", "잠깐 놀다 가"],
        lv4: ["열심히 했네! 같이 쉬자", "기지개 한번 켜자"],
        lv5: ["수고했어! 같이 쉬자", "쉬는 동안 옆에 있을게"],
      },
      decorated: {
        lv1: ["멍?!", "킁킁… 왈!"],
        lv2: ["멍! 예뻐!", "왈, 새거다!"],
        lv3: ["방이 예뻐졌어!", "새거다, 신난다!"],
        lv4: ["여기 마음에 들어", "우리 방 최고야"],
        lv5: ["같이 꾸미니까 좋다", "너랑 사는 방이야"],
      },
      // 궁전 세트를 다 놓았을 때, 평소 혼잣말과 번갈아
      palace: {
        lv1: "멍! 반짝반짝!",
        lv2: "멍! 반짝반짝!",
        lv3: "우리 집 궁전 같아!",
        lv4: "우리 집 궁전 같아!",
        lv5: "우리 집 궁전 같아!",
      },
      levelUp: {
        lv2: "멍… 아, 안녕?!",
        lv3: "이제 말 잘하지? 헤헤",
        lv4: "우리 진짜 친해졌다!",
        lv5: "넌 내 단짝이야!",
      },
      sleep: "쿨쿨…",
    },
    panel: { collapse: "접기", expand: "펼치기" },
    // 에디션 세트 넷을 모두 놓았을 때 헤더 안내 (궁전 I-067, 아이돌 무대)
    edition: { palace: "궁전 에디션이 됐어요!", stage: "VIP 에디션이 됐어요!" },
    // VIP 선물 상자 (I-070)
    snow: {
      title: "눈송이 상자",
      arrived: "눈송이 상자가 왔어요!",
      open: "눈송이 상자 열기",
      lead: "오늘의 선물: 눈송이 {count}개",
      take: "받기",
      welcome: {
        title: "크리스마스가 다가와요",
        text: "11월부터 2월까지 하루 한 번 눈송이를 받아요. 눈송이로 크리스마스 꾸미기 6가지를 만들 수 있어요.",
      },
    },
    // 상자가 여러 개면 쌓아 두고 차례로 엶 (I-074)
    boxes: {
      arrived: "상자가 {count}개 왔어요!",
      open: "상자 {count}개 열기",
      step: "{index}/{total}",
    },
    gift: {
      title: "VIP 선물 상자",
      arrived: "VIP 선물 상자가 왔어요!",
      open: "VIP 선물 상자 열기",
      lead: "오늘의 선물: 산책 재료 {count}가지를 하나씩",
      take: "받기",
      toSets: "세트 보러 가기",
      welcome: {
        title: "VIP 혜택",
        text: "아이돌 무대 세트를 받았어요. 아이템 상자 › 세트에서 바로 적용할 수 있어요.",
      },
    },
    log: {
      title: "기록",
      more: "더 보기 ({count})",
      less: "줄여 보기",
      enter: "까미를 만나러 왔어요",
      wake: "까미가 일어났어요",
      pat: "쓰다듬었어요",
      patTotal: "누적 {count}번",
      snack: "간식을 줬어요",
      walkOut: "산책을 나갔어요",
      found: "{object} 주웠어요",
      home: "집에 돌아왔어요",
      skipped: "산책을 건너뛰고 {object} 주워 왔어요",
      levelHeart: "Lv.{level} 달성! 하트를 받았어요",
      stamp: "사이클 완료! 발바닥 도장을 받았어요",
      edition: {
        palace: "궁전 세트를 다 놓아 게임기가 궁전 에디션이 됐어요",
        stage: "아이돌 무대 세트를 다 놓아 게임기가 VIP 에디션이 됐어요",
      },
      craft: "{object} 만들었어요",
      place: "{slot} {to} 바꿨어요",
      set: "방을 {to} 꾸몄어요",
      gift: "VIP 선물 상자에서 산책 재료 {count}개를 받았어요",
      snow: "눈송이 상자에서 눈송이 {count}개를 받았어요",
      walkLimit: "오늘 산책 {count}번을 다 했어요. 내일 또 가요!",
      snackLimit: "오늘 간식 {count}번을 다 줬어요. 내일 또 줄게요!",
    },
    affinity: {
      title: "친밀도",
      level: "Lv.{level}",
      loading: "불러오는 중",
      progress: "친밀도 {level}단계, {points}점",
      nextStage: "다음: {name}",
      maxStage: "최고 단계",
      points: "{points} / {next}점",
      left: "{count}점 남음",
      max: "MAX · {points}점",
      todayTitle: "오늘 쓰담 보너스",
      todayRule: "하루 첫 {count}번 · 한 번에 +{points}",
      todayDone: "오늘 다 받았어요",
      todayLeft: "+{earned} / {max}",
      snackHint: "간식은 하루 {count}번까지 · 한 번에 +{points}",
      levelUpHeart: "Lv.{level} 달성! 하트 +1",
      maxBadge: "MAX",
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

    label: "까미의 작은 방",
    name: "까미",
    idle: "편안해요",
    sleeping: "자는 중",
    wake: "살며시 깨우기",
    wakeLabel: "까미 깨우기",
    happy: "행복해요",
    pet: "쓰다듬기",
    feed: "간식 주기",
    snackHappy: "맛있어요",
    petLabel: "까미 쓰다듬기",
    keyboard: "키보드로는 버튼에 초점을 맞추고 Enter 또는 Space를 눌러요.",
    error: "까미를 불러오지 못했어요.",
    retry: "다시 불러오기",
    // 휴식 남은 시간 옆 (멈췄으면 "멈춤")
    break: { left: "남음", paused: "멈춤" },
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
      pet: "다마고치",
    },
    menu: {
      label: "메뉴",
      darkMode: "다크 모드",
      language: "언어",
      settings: "설정",
      guide: "사용법",
      login: "로그인",
      profile: "내 프로필: {name}",
      admin: "관리자",
    },
    /** 푸터·로그인 화면의 약관 링크 */
    legal: {
      privacy: "개인정보처리방침",
      terms: "이용약관",
    },
  },
  /** 관리자 페이지 (/admin) */
  admin: {
    title: "관리자",
    loading: "불러오는 중…",
    notAllowed: "관리자만 볼 수 있어요.",
    failed: "불러오지 못했어요. 잠시 뒤 다시 해 주세요.",
    retry: "다시 불러오기",
    stats: {
      title: "한눈에 보기",
      total: "전체 회원",
      vip: "VIP",
      newUsers: "최근 7일 가입",
      activeUsers: "최근 7일 집중한 회원",
      focusSessions: "최근 7일 집중",
    },
    users: {
      title: "회원 {count}명",
      search: "닉네임·이메일 검색",
      empty: "찾는 회원이 없어요.",
      noName: "(이름 없음)",
      joined: "가입 {date}",
      lastSignIn: "최근 로그인 {date}",
      focus: "집중 {count}회",
      vipLabel: "{name} VIP",
      saveFailed: "VIP를 바꾸지 못했어요. 잠시 뒤 다시 해 주세요.",
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
      stamp: "발바닥 도장 +1",
    },
    breakSnack: {
      short: "짧은 휴식! 까미랑 놀까요?",
      long: "긴 휴식! 까미랑 산책 갈까요?",
      go: "보러 가기",
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
      stream: { label: "시냇물", description: "졸졸 흐르는 물" },
      airplane: { label: "비행기 기내", description: "낮게 울리는 엔진" },
      library: { label: "도서관", description: "조용한 책장 사이" },
      cafe: { label: "카페", description: "나지막한 대화와 커피" },
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
      vip: "VIP",
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
        "로그아웃하면 이 브라우저의 할 일, 기록, 타이머, 까미 기록이 지워져요. 계정에는 그대로 남아 있어서 다시 로그인하면 돌아와요.",
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
