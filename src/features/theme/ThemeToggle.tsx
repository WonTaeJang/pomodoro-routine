"use client";

import { MoonIcon, SunIcon } from "@/components/icons";
import { IconButton } from "@/components/ui";
import { setTheme, useTheme } from "./theme";

/** 라이트/다크 모드 전환 버튼 */
export function ThemeToggle() {
  const theme = useTheme();
  const isDark = theme === "dark";

  return (
    <IconButton
      label={isDark ? "라이트 모드로 바꾸기" : "다크 모드로 바꾸기"}
      icon={isDark ? <SunIcon /> : <MoonIcon />}
      disabled={theme === null}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    />
  );
}
