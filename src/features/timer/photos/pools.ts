import type { StaticImageData } from "next/image";
import kkamiDefault from "@/assets/kkami/kkami-default.webp";
import kkamiDefault005 from "@/assets/kkami/kkami-default-005.webp";
import kkamiDefault010 from "@/assets/kkami/kkami-default-010.webp";
import kkamiDefault018 from "@/assets/kkami/kkami-default-018.webp";
import kkamiDefault028 from "@/assets/kkami/kkami-default-028.webp";
import kkamiDone from "@/assets/kkami/kkami-done.webp";
import kkamiDone012 from "@/assets/kkami/kkami-done-012.webp";
import kkamiDone029 from "@/assets/kkami/kkami-done-029.webp";
import kkamiDone2236 from "@/assets/kkami/kkami-done-22-36-30.webp";
import kkamiFocus from "@/assets/kkami/kkami-focus.webp";
import kkamiFocus006 from "@/assets/kkami/kkami-focus-006.webp";
import kkamiFocus007 from "@/assets/kkami/kkami-focus-007.webp";
import kkamiFocus009 from "@/assets/kkami/kkami-focus-009.webp";
import kkamiFocus011 from "@/assets/kkami/kkami-focus-011.webp";
import kkamiFocus014 from "@/assets/kkami/kkami-focus-014.webp";
import kkamiFocus025 from "@/assets/kkami/kkami-focus-025.webp";
import kkamiLongBreak from "@/assets/kkami/kkami-long-break.webp";
import kkamiLongBreak001 from "@/assets/kkami/kkami-long-break-001.webp";
import kkamiLongBreak017 from "@/assets/kkami/kkami-long-break-017.webp";
import kkamiLongBreak021 from "@/assets/kkami/kkami-long-break-021.webp";
import kkamiLongBreak023 from "@/assets/kkami/kkami-long-break-023.webp";
import kkamiLongBreak026 from "@/assets/kkami/kkami-long-break-026.webp";
import kkamiLongBreak030 from "@/assets/kkami/kkami-long-break-030.webp";
import kkamiShortBreak from "@/assets/kkami/kkami-short-break.webp";
import kkamiShortBreak003 from "@/assets/kkami/kkami-short-break-003.webp";
import kkamiShortBreak008 from "@/assets/kkami/kkami-short-break-008.webp";
import kkamiShortBreak015 from "@/assets/kkami/kkami-short-break-015.webp";
import kkamiShortBreak020 from "@/assets/kkami/kkami-short-break-020.webp";
import type { TimerMode } from "../types";

/** 사진 묶음. default: 시작 전(정면으로 기다림), done: 집중 완료(웃는 모습). 사진 설명은 kkami.<묶음> 문구 */
export type PhotoPool = "default" | TimerMode | "done";

/**
 * 상황별 까미 사진 묶음. 이 중 하나를 랜덤으로 보여 줍니다.
 * 파일 이름 끝 번호는 원본 사진(`design/kkami/`) 번호. 원형 프레임에 맞게 잘라 둔 480px webp입니다.
 */
export const KKAMI_PHOTOS: Record<PhotoPool, readonly StaticImageData[]> = {
  default: [
    kkamiDefault,
    kkamiDefault028,
    kkamiDefault018,
    kkamiDefault010,
    kkamiDefault005,
  ],
  focus: [
    kkamiFocus,
    kkamiFocus007,
    kkamiFocus011,
    kkamiFocus014,
    kkamiFocus009,
    kkamiFocus025,
    kkamiFocus006,
  ],
  "short-break": [
    kkamiShortBreak,
    kkamiShortBreak003,
    kkamiShortBreak020,
    kkamiShortBreak015,
    kkamiShortBreak008,
  ],
  "long-break": [
    kkamiLongBreak,
    kkamiLongBreak021,
    kkamiLongBreak001,
    kkamiLongBreak017,
    kkamiLongBreak023,
    kkamiLongBreak026,
    kkamiLongBreak030,
  ],
  done: [kkamiDone, kkamiDone029, kkamiDone2236, kkamiDone012],
};
