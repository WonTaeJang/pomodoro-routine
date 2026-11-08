"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { BookIcon, MenuIcon, MoonIcon, SettingsIcon } from "@/components/icons";
import { IconButton, SwitchTrack } from "@/components/ui";
import { SettingsDialog } from "@/features/settings/components/SettingsDialog";
import { SHORTCUTS, useShortcuts } from "@/features/shortcuts";
import { setTheme, useTheme } from "@/features/theme/theme";
import styles from "./HeaderMenu.module.scss";

type HeaderMenuProps = {
  /** 저장된 값을 불러오기 전이면 false (설정 창을 열지 않음) */
  ready: boolean;
};

/**
 * 헤더 오른쪽 끝의 메뉴(☰). 누르면 아래로 목록이 펼쳐집니다: 다크 모드, 설정, 사용법.
 * 바깥을 누르거나 ESC로 닫히고, 위·아래 화살표로 항목을 옮겨 다닙니다.
 * 설정 창은 S 키로도 바로 열립니다.
 */
export function HeaderMenu({ ready }: HeaderMenuProps) {
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useSettingsOpen(buttonRef);
  useShortcuts({ settings: () => setSettingsOpen(true) }, ready);

  const theme = useTheme();
  const isDark = theme === "dark";

  const close = () => menuRef.current?.hidePopover();

  return (
    <>
      <IconButton
        ref={buttonRef}
        label="메뉴"
        icon={<MenuIcon />}
        popoverTarget={menuId}
        aria-haspopup="menu"
      />
      {/* 브라우저 기본 펼침 창(popover): 바깥을 누르거나 ESC로 닫힘 */}
      <div
        ref={menuRef}
        id={menuId}
        popover="auto"
        role="menu"
        aria-label="메뉴"
        className={styles.menu}
        // 펼치면 첫 항목으로 (키보드로 바로 고를 수 있게)
        onToggle={(e) => {
          if (e.newState === "open") menuItems(e.currentTarget)[0]?.focus();
        }}
        onKeyDown={(e) => moveFocus(e)}
      >
        {/* 테마는 메뉴를 연 채로 바뀜 */}
        <button
          type="button"
          role="menuitemcheckbox"
          aria-checked={isDark}
          className={styles.item}
          disabled={theme === null}
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          <ItemLabel icon={<MoonIcon />}>다크 모드</ItemLabel>
          <SwitchTrack checked={isDark} />
        </button>
        <button
          type="button"
          role="menuitem"
          aria-keyshortcuts={SHORTCUTS.settings.key}
          className={styles.item}
          disabled={!ready}
          onClick={() => {
            close();
            setSettingsOpen(true);
          }}
        >
          <ItemLabel icon={<SettingsIcon />}>설정</ItemLabel>
          <kbd className={styles.key}>{SHORTCUTS.settings.key}</kbd>
        </button>
        <Link
          href="/guide"
          role="menuitem"
          className={styles.item}
          onClick={close}
        >
          <ItemLabel icon={<BookIcon />}>사용법</ItemLabel>
        </Link>
      </div>
      {/* 열 때만 그려서, 열 때마다 알림 권한 같은 현재 상태를 새로 읽음 */}
      {settingsOpen ? (
        <SettingsDialog onClose={() => setSettingsOpen(false)} />
      ) : null}
    </>
  );
}

/**
 * 설정 창 열림 상태. 닫히면 열기 전에 있던 곳으로 포커스를 돌려줌.
 * 메뉴에서 열었으면 그 항목은 접힌 메뉴 안이라 메뉴 버튼으로.
 * (설정 창이 열려 있는 동안은 뒤 화면을 누를 수 없어서, 창이 사라진 뒤에 옮김)
 */
function useSettingsOpen(
  fallback: RefObject<HTMLElement | null>,
): [boolean, (open: boolean) => void] {
  const [open, setOpen] = useState(false);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) return;
    const target = returnTo.current;
    returnTo.current = null;
    if (!target) return;
    (target.checkVisibility() ? target : fallback.current)?.focus();
  }, [open, fallback]);

  function setSettingsOpen(next: boolean) {
    if (next && !open) {
      returnTo.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    }
    setOpen(next);
  }
  return [open, setSettingsOpen];
}

function ItemLabel({ icon, children }: { icon: ReactNode; children: string }) {
  return (
    <span className={styles.label}>
      {icon}
      {children}
    </span>
  );
}

function menuItems(menu: HTMLElement): HTMLElement[] {
  return [
    ...menu.querySelectorAll<HTMLElement>('[role^="menuitem"]:not(:disabled)'),
  ];
}

/** 위·아래 화살표, Home, End로 항목 사이를 옮김 (끝에서는 처음으로 돌아감) */
function moveFocus(e: KeyboardEvent<HTMLElement>) {
  const items = menuItems(e.currentTarget);
  const index = items.indexOf(document.activeElement as HTMLElement);
  const next =
    e.key === "ArrowDown"
      ? (index + 1) % items.length
      : e.key === "ArrowUp"
        ? (index <= 0 ? items.length : index) - 1
        : e.key === "Home"
          ? 0
          : e.key === "End"
            ? items.length - 1
            : null;
  if (next === null) return;
  e.preventDefault();
  items[next]?.focus();
}
