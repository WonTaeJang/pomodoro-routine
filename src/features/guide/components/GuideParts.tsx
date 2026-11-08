import { Fragment, type ComponentType } from "react";
import {
  BellIcon,
  CalendarIcon,
  CheckIcon,
  GripIcon,
  HeadphonesIcon,
  KeyboardIcon,
  MedalIcon,
  MenuIcon,
  PawIcon,
  PlayIcon,
  ResetIcon,
  SaveIcon,
  SkipIcon,
  TimerIcon,
  type IconProps,
} from "@/components/icons";
import { VisuallyHidden } from "@/components/ui";
import { ShortcutList } from "@/features/shortcuts";
import {
  INLINE_ICON_LABELS,
  type GuideIcon,
  type GuideSection,
  type InlineIcon,
} from "../content.ko";
import styles from "./GuideParts.module.scss";

const SECTION_ICONS: Record<GuideIcon, ComponentType<IconProps>> = {
  paw: PawIcon,
  timer: TimerIcon,
  check: CheckIcon,
  headphones: HeadphonesIcon,
  calendar: CalendarIcon,
  medal: MedalIcon,
  bell: BellIcon,
  keyboard: KeyboardIcon,
  save: SaveIcon,
};

const INLINE_ICONS: Record<InlineIcon, ComponentType<IconProps>> = {
  paw: PawIcon,
  calendar: CalendarIcon,
  menu: MenuIcon,
  play: PlayIcon,
  reset: ResetIcon,
  skip: SkipIcon,
  grip: GripIcon,
  headphones: HeadphonesIcon,
  medal: MedalIcon,
};

export function SectionIcon({
  icon,
  size = 20,
}: {
  icon: GuideIcon;
  size?: number;
}) {
  const Icon = SECTION_ICONS[icon];
  return <Icon size={size} />;
}

const isInlineIcon = (name: string): name is InlineIcon => name in INLINE_ICONS;

/** 문구 속 `{paw}` 같은 자리에 앱 아이콘을 넣음. 화면 낭독기는 아이콘 대신 이름을 읽음 */
export function GuideText({ text }: { text: string }) {
  // split에 괄호 묶음을 쓰면 홀수 자리에 아이콘 이름이 들어옴
  const parts = text.split(/\{(\w+)\}/);
  return parts.map((part, i) => {
    if (i % 2 === 0 || !isInlineIcon(part)) {
      return <Fragment key={i}>{part}</Fragment>;
    }
    const Icon = INLINE_ICONS[part];
    return (
      <span key={i} className={styles.inlineIcon}>
        <Icon size={16} />
        <VisuallyHidden>{INLINE_ICON_LABELS[part]}</VisuallyHidden>
      </span>
    );
  });
}

/** 섹션 본문: 요점 목록 (+ 단축키 섹션이면 단축키 목록) */
export function SectionBody({ section }: { section: GuideSection }) {
  return (
    <>
      <ul className={styles.points}>
        {section.points.map((point) => (
          <li key={point}>
            <GuideText text={point} />
          </li>
        ))}
      </ul>
      {section.id === "shortcuts" ? (
        <ShortcutList className={styles.shortcuts} />
      ) : null}
    </>
  );
}
