"use client";

import { useTranslations } from "use-intl";
import {
  CalendarIcon,
  HeadphonesIcon,
  MedalIcon,
  MenuIcon,
  MinusIcon,
  PawIcon,
  PlayIcon,
  PlusIcon,
} from "@/components/icons";
import { ShortcutList } from "@/features/shortcuts";
import type { OnboardingSlide } from "../content";
import styles from "./OnboardingArt.module.scss";

/**
 * 안내 장마다 위쪽 그림. 실제 화면의 버튼·입력칸을 작게 흉내 낸 모양이라
 * 누를 수 없고 화면 낭독기에서는 숨깁니다 (설명은 아래 글이 함).
 * 단축키 장은 실제 단축키 목록을 그대로 보여줌.
 */
export function OnboardingArt({ id }: { id: OnboardingSlide["id"] }) {
  if (id === "shortcuts") {
    return (
      <div className={styles.art}>
        <ShortcutList className={styles.shortcuts} />
      </div>
    );
  }
  return (
    <div className={styles.art} aria-hidden="true">
      {id === "welcome" ? <CycleMock /> : null}
      {id === "start" ? <StartMock /> : null}
      {id === "more" ? <HeaderMock /> : null}
    </div>
  );
}

/** 집중(발자국) 4번, 사이사이 짧은 휴식(점), 끝에 수료증(메달) */
function CycleMock() {
  return (
    <div className={styles.cycle}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={styles.cycleStep}>
          {i > 0 ? <span className={styles.rest} /> : null}
          <span className={styles.focus}>
            <PawIcon size={18} />
          </span>
        </span>
      ))}
      <span className={styles.arrow}>→</span>
      <span className={styles.medal}>
        <MedalIcon size={20} />
      </span>
    </div>
  );
}

/** 할 일 입력칸 + 예상 발자국 + 시작 버튼 */
function StartMock() {
  const t = useTranslations("tasks");
  return (
    <div className={styles.start}>
      <div className={styles.taskRow}>
        <span className={styles.input}>{t("placeholder")}</span>
        <span className={styles.stepper}>
          <MinusIcon size={12} />
          <PawIcon size={12} />1
          <PlusIcon size={12} />
        </span>
      </div>
      <span className={styles.play}>
        <PlayIcon size={22} />
      </span>
    </div>
  );
}

/** 헤더의 집중 소리, 캘린더, 메뉴 */
function HeaderMock() {
  const t = useTranslations();
  return (
    <div className={styles.header}>
      <span className={styles.headerItem}>
        <span className={styles.round}>
          <HeadphonesIcon size={20} />
        </span>
        {t("focusSound.title")}
      </span>
      <span className={styles.headerItem}>
        <span className={styles.round}>
          <CalendarIcon size={20} />
        </span>
        {t("app.nav.calendar")}
      </span>
      <span className={styles.headerItem}>
        <span className={styles.round}>
          <MenuIcon size={20} />
        </span>
        {t("app.menu.label")}
      </span>
    </div>
  );
}
