import type { ComponentProps, ComponentType, ReactNode } from "react";

export type IconProps = Omit<ComponentProps<"svg">, "children"> & {
  /** 아이콘 크기(px). 기본 20 */
  size?: number;
  /** 아이콘만으로 의미를 전달할 때 화면 낭독기가 읽을 이름. 없으면 장식으로 취급 */
  title?: string;
};

/** 아이콘 컴포넌트 자체 (목록에 아이콘을 담아 둘 때) */
export type IconComponent = ComponentType<IconProps>;

/**
 * 모든 아이콘의 바탕. 24x24 격자에 선 두께 2로 그리고, 색은 글자색(currentColor)을 따릅니다.
 */
export function Icon({
  size = 20,
  title,
  children,
  ...rest
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...(title ? { role: "img" } : { "aria-hidden": true })}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}
