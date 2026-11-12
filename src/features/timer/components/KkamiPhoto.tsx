import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import { useTranslations } from "use-intl";
import { cx } from "@/lib/cx";
import type { PhotoPool } from "../photos/pools";
import { useKkamiPhoto } from "../photos/useKkamiPhoto";
import type { TimerMode, TimerStatus } from "../types";
import styles from "./KkamiPhoto.module.scss";

/** 지금 상황에 맞는 사진 묶음 */
function pickPool(mode: TimerMode, status: TimerStatus): PhotoPool {
  if (mode === "focus") return status === "idle" ? "default" : "focus";
  return mode;
}

type Shown = { src: StaticImageData; pool: PhotoPool };

type Layers = {
  previous: Shown | null;
  current: Shown | null;
  /** 지금 사진을 서서히 나타나게 할지 */
  fadeIn: boolean;
};

type KkamiPhotoProps = {
  mode: TimerMode;
  status: TimerStatus;
  /** 저장된 타이머를 불러오기 전이면 false. 그동안은 사진을 고르지 않습니다. */
  ready: boolean;
};

/**
 * 상황에 따라 바뀌는 까미 사진. 상황(묶음)이 바뀔 때마다 묶음에서 한 장을 랜덤으로 고릅니다.
 * 지금 사진만 받고, 바뀔 때는 새 사진을 바로 전 사진 위로 서서히 겹쳐 깜빡이지 않게 넘어갑니다.
 */
export function KkamiPhoto({ mode, status, ready }: KkamiPhotoProps) {
  const pool = pickPool(mode, status);
  const src = useKkamiPhoto("timer", ready ? pool : null, pool);
  const t = useTranslations("kkami");

  // 바로 전 사진은 새 사진이 덮을 때까지 아래에 남겨 둠.
  // 새 사진을 고르는 동안(src가 잠깐 null)에는 지금 사진을 그대로 보여 줌.
  // 처음부터 사진이 정해져 있으면(다른 페이지에서 돌아옴) 서서히 나타나지 않고 바로 보임
  const [layers, setLayers] = useState<Layers>(() => ({
    previous: null,
    current: src ? { src, pool } : null,
    fadeIn: false,
  }));
  if (src !== null && src !== layers.current?.src) {
    setLayers({
      previous: layers.current,
      current: { src, pool },
      fadeIn: true,
    });
  }

  // 한 목록으로 그려서, 지금 사진이 "바로 전 사진"이 될 때 새로 만들지 않고 그대로 옮겨지게 함
  const shown = [layers.previous, layers.current].filter((s) => s !== null);
  return (
    <div className={styles.frame}>
      {shown.map((photo) => {
        const isCurrent = photo === layers.current;
        return (
          <Image
            key={photo.src.src}
            src={photo.src}
            alt={isCurrent ? t(photo.pool) : ""}
            aria-hidden={!isCurrent}
            sizes="160px"
            loading="eager"
            placeholder="blur"
            className={cx(
              styles.photo,
              isCurrent && layers.fadeIn && styles.enter,
            )}
          />
        );
      })}
    </div>
  );
}
