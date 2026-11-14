import {
  AirplaneIcon,
  BookIcon,
  CloudRainIcon,
  CoffeeIcon,
  FlameIcon,
  NoiseBrownIcon,
  NoisePinkIcon,
  NoiseWhiteIcon,
  StreamIcon,
  TreeIcon,
  WavesIcon,
  WindowRainIcon,
  type IconComponent,
} from "@/components/icons";
import {
  brownNoise,
  pinkNoise,
  whiteNoise,
  type Random,
  type Samples,
} from "./noise";
import recordings from "./recordings.json";

/** 집중 소리 종류 */
export const FOCUS_SOUND_IDS = [
  "white",
  "pink",
  "brown",
  "rain",
  "window-rain",
  "fireplace",
  "forest",
  "waves",
  "stream",
  "airplane",
  "library",
  "cafe",
] as const;
export type FocusSoundId = (typeof FOCUS_SOUND_IDS)[number];

/** 설정값: 소리 종류, 끄기, 또는 집중마다 랜덤 (random.ts) */
export type FocusSoundSetting = FocusSoundId | "off" | "random";

/** 저장된 값이 지금 앱에 있는 설정값인지 (예전에 있다가 빠진 소리면 false) */
export function isFocusSoundSetting(
  value: unknown,
): value is FocusSoundSetting {
  return (
    value === "off" ||
    value === "random" ||
    FOCUS_SOUND_IDS.includes(value as FocusSoundId)
  );
}

/** 브라우저에서 바로 만드는 소리 */
export type SynthSound = {
  kind: "synth";
  /** 한 번 만들어 반복하는 길이 (초) */
  seconds: number;
  generate: (length: number, rand: Random) => Samples;
};

/**
 * 녹음 파일. scripts/focus-sounds.mjs로 만들고 처음 고를 때 받습니다.
 * 파일 끝에 이음매를 겹칠 길이(fade)만큼 더 들어 있어서, 재생할 때 겹쳐서 끊김 없이 반복합니다.
 */
export type RecordedSound = {
  kind: "recording";
  src: string;
  /** 이음매를 겹칠 길이 (초) */
  fade: number;
};

/** 녹음 파일 정보 (자를 구간, 이음매 길이는 스크립트와 함께 쓰는 recordings.json에서) */
function recording(id: FocusSoundId): RecordedSound {
  const config = recordings.find((r) => r.id === id);
  if (!config) throw new Error(`recordings.json에 ${id}가 없음`);
  return { kind: "recording", src: `/sounds/${id}.m4a`, fade: config.fade };
}

/** 이름과 짧은 설명은 화면 문구 사전에 (focusSound.sounds.<id>) */
type FocusSound = (SynthSound | RecordedSound) & {
  /** 창의 칸에 그리는 아이콘 */
  icon: IconComponent;
  /**
   * 같은 크기 설정에서 비슷하게 들리도록 맞추는 값.
   * 녹음은 파일을 만들 때 같은 크기(-20 LUFS)로 맞췄고, 노이즈는 그 크기에 맞춤
   */
  level: number;
};

export const FOCUS_SOUNDS: Record<FocusSoundId, FocusSound> = {
  white: {
    kind: "synth",
    icon: NoiseWhiteIcon,
    seconds: 6,
    level: 0.21,
    generate: whiteNoise,
  },
  pink: {
    kind: "synth",
    icon: NoisePinkIcon,
    seconds: 6,
    level: 0.31,
    generate: pinkNoise,
  },
  brown: {
    kind: "synth",
    icon: NoiseBrownIcon,
    seconds: 8,
    level: 0.43,
    generate: brownNoise,
  },
  rain: {
    ...recording("rain"),
    icon: CloudRainIcon,
    level: 0.85,
  },
  "window-rain": {
    ...recording("window-rain"),
    icon: WindowRainIcon,
    level: 0.85,
  },
  fireplace: {
    ...recording("fireplace"),
    icon: FlameIcon,
    level: 0.85,
  },
  forest: {
    ...recording("forest"),
    icon: TreeIcon,
    level: 0.85,
  },
  waves: {
    ...recording("waves"),
    icon: WavesIcon,
    level: 0.85,
  },
  // 쉬지 않고 졸졸 흐르는 넓은 소리라 같은 크기(LUFS)여도 다른 녹음보다 크게 들려서 조금 낮춤
  stream: {
    ...recording("stream"),
    icon: StreamIcon,
    level: 0.6,
  },
  airplane: {
    ...recording("airplane"),
    icon: AirplaneIcon,
    level: 0.85,
  },
  library: {
    ...recording("library"),
    icon: BookIcon,
    level: 0.85,
  },
  cafe: {
    ...recording("cafe"),
    icon: CoffeeIcon,
    level: 0.85,
  },
};

/** 창에서 묶어 보여주는 순서. 묶음 이름은 focusSound.groups.<id> */
export const FOCUS_SOUND_GROUPS: {
  id: "noise" | "nature" | "places";
  ids: FocusSoundId[];
}[] = [
  { id: "noise", ids: ["white", "pink", "brown"] },
  {
    id: "nature",
    ids: ["rain", "window-rain", "fireplace", "forest", "waves", "stream"],
  },
  // 어떤 곳에 있는 듯한 소리
  { id: "places", ids: ["airplane", "library", "cafe"] },
];
