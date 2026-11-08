import {
  CloudRainIcon,
  FlameIcon,
  NoiseBrownIcon,
  NoisePinkIcon,
  NoiseWhiteIcon,
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
] as const;
export type FocusSoundId = (typeof FOCUS_SOUND_IDS)[number];

/** 설정값: 소리 종류 또는 끄기 */
export type FocusSoundSetting = FocusSoundId | "off";

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

type FocusSound = (SynthSound | RecordedSound) & {
  label: string;
  /** 짧은 설명 (한 줄) */
  description: string;
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
    label: "백색소음",
    description: "고른 치이익",
    icon: NoiseWhiteIcon,
    seconds: 6,
    level: 0.21,
    generate: whiteNoise,
  },
  pink: {
    kind: "synth",
    label: "핑크 노이즈",
    description: "부드러운 쏴아",
    icon: NoisePinkIcon,
    seconds: 6,
    level: 0.31,
    generate: pinkNoise,
  },
  brown: {
    kind: "synth",
    label: "브라운 노이즈",
    description: "묵직한 웅웅",
    icon: NoiseBrownIcon,
    seconds: 8,
    level: 0.43,
    generate: brownNoise,
  },
  rain: {
    ...recording("rain"),
    label: "빗소리",
    description: "쏴아 내리는 비",
    icon: CloudRainIcon,
    level: 0.85,
  },
  "window-rain": {
    ...recording("window-rain"),
    label: "창가 빗소리",
    description: "유리창에 톡톡",
    icon: WindowRainIcon,
    level: 0.85,
  },
  fireplace: {
    ...recording("fireplace"),
    label: "모닥불",
    description: "타닥타닥 장작",
    icon: FlameIcon,
    level: 0.85,
  },
  forest: {
    ...recording("forest"),
    label: "숲속",
    description: "새소리와 나뭇잎",
    icon: TreeIcon,
    level: 0.85,
  },
  waves: {
    ...recording("waves"),
    label: "파도",
    description: "잔잔한 바다",
    icon: WavesIcon,
    level: 0.85,
  },
};

/** 창에서 묶어 보여주는 순서 */
export const FOCUS_SOUND_GROUPS: { title: string; ids: FocusSoundId[] }[] = [
  { title: "노이즈", ids: ["white", "pink", "brown"] },
  {
    title: "자연의 소리",
    ids: ["rain", "window-rain", "fireplace", "forest", "waves"],
  },
];
