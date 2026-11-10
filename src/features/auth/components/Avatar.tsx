"use client";

import Image from "next/image";
import { useState } from "react";
import { UserIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import styles from "./Avatar.module.scss";

type AvatarProps = {
  src: string | null;
  /** 화면 낭독기용 설명. 옆에 이름이 같이 보이면 빈 값 */
  alt: string;
  size: number;
  className?: string;
};

/** 동그란 프로필 사진. 사진이 없거나 못 불러오면 사람 아이콘 */
export function Avatar({ src, alt, size, className }: AvatarProps) {
  // 이 주소의 사진을 못 불러왔으면 아이콘 (주소가 바뀌면 다시 시도)
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const style = { width: size, height: size };

  if (!src || failedSrc === src) {
    return (
      <span
        className={cx(styles.avatar, styles.fallback, className)}
        style={style}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
      >
        <UserIcon size={Math.round(size * 0.6)} />
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      // 구글 등 바깥 주소의 작은 사진이라 그대로 불러옴 (이미지 최적화·주소 허용 설정 없이)
      unoptimized
      referrerPolicy="no-referrer"
      className={cx(styles.avatar, className)}
      style={style}
      onError={() => setFailedSrc(src)}
    />
  );
}
