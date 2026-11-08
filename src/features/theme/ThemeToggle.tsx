"use client";

import { MoonIcon, SunIcon } from "@/components/icons";
import { IconButton } from "@/components/ui";
import { setTheme, useTheme } from "./theme";
import styles from "./ThemeToggle.module.scss";

/** 라이트/다크 모드 전환 버튼. 아주 좁은 화면에서는 숨김 (설정 창에도 있음) */
export function ThemeToggle() {
  const theme = useTheme();
  const isDark = theme === "dark";

  return (
    <IconButton
      label={isDark ? "라이트 모드로 바꾸기" : "다크 모드로 바꾸기"}
      icon={isDark ? <SunIcon /> : <MoonIcon />}
      disabled={theme === null}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={styles.toggle}
    />
  );
}
