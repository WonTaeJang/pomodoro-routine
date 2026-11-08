"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarIcon, TimerIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import styles from "./AppNav.module.scss";

const PAGES = [
  { href: "/", label: "타이머", icon: TimerIcon },
  { href: "/calendar", label: "캘린더", icon: CalendarIcon },
] as const;

/**
 * 헤더의 페이지 이동 메뉴 (타이머 / 캘린더).
 * 넓은 화면은 아이콘과 이름, 휴대폰은 아이콘만 (이름은 화면 낭독기와 툴팁으로).
 * 지금 페이지는 둥근 흰 배경과 강조색으로 표시
 */
export function AppNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="페이지">
      <ul className={styles.list}>
        {PAGES.map(({ href, label, icon: PageIcon }) => {
          const current = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                title={label}
                className={cx(styles.link, current && styles.current)}
                aria-current={current ? "page" : undefined}
              >
                <PageIcon size={18} />
                <span className={styles.label}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
