import Image, { type StaticImageData } from "next/image";
import { useTranslations } from "use-intl";
import kkamiDefault from "@/assets/kkami/kkami-default.webp";
import kkamiFocus from "@/assets/kkami/kkami-focus.webp";
import kkamiLongBreak from "@/assets/kkami/kkami-long-break.webp";
import kkamiShortBreak from "@/assets/kkami/kkami-short-break.webp";
import { cx } from "@/lib/cx";
import type { TimerMode, TimerStatus } from "../types";
import styles from "./KkamiPhoto.module.scss";

type PhotoKey = "default" | TimerMode;

/** 사진 설명(alt)은 kkami.<key> 문구 */
const PHOTOS: { key: PhotoKey; src: StaticImageData }[] = [
  { key: "default", src: kkamiDefault },
  { key: "focus", src: kkamiFocus },
  { key: "short-break", src: kkamiShortBreak },
  { key: "long-break", src: kkamiLongBreak },
];

/** 지금 상황에 맞는 까미 사진 */
function pickPhoto(mode: TimerMode, status: TimerStatus): PhotoKey {
  if (mode === "focus") return status === "idle" ? "default" : "focus";
  return mode;
}

type KkamiPhotoProps = {
  mode: TimerMode;
  status: TimerStatus;
};

/**
 * 모드에 따라 바뀌는 까미 사진.
 * 사진 4장을 겹쳐 두고 보이는 것만 바꿔서, 바뀔 때 깜빡이지 않고 부드럽게 넘어갑니다.
 */
export function KkamiPhoto({ mode, status }: KkamiPhotoProps) {
  const active = pickPhoto(mode, status);
  const t = useTranslations("kkami");

  return (
    <div className={styles.frame}>
      {PHOTOS.map((photo) => (
        <Image
          key={photo.key}
          src={photo.src}
          alt={photo.key === active ? t(photo.key) : ""}
          aria-hidden={photo.key !== active}
          sizes="160px"
          loading="eager"
          placeholder="blur"
          className={cx(styles.photo, photo.key === active && styles.active)}
        />
      ))}
    </div>
  );
}
