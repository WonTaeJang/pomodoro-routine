"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";
import styles from "./AppNav.module.scss";

const PAGES = [
  { href: "/", label: "타이머" },
  { href: "/calendar", label: "캘린더" },
] as const;

/** 헤더의 페이지 이동 메뉴 (타이머 / 캘린더) */
export function AppNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="페이지">
      <ul className={styles.list}>
        {PAGES.map(({ href, label }) => {
          const current = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={cx(styles.link, current && styles.current)}
                aria-current={current ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
