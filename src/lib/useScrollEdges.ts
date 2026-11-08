"use client";

import { useEffect, useState, type RefObject } from "react";

type ScrollEdges = {
  /** 위로 가려진 내용이 있음 (스크롤을 내린 상태) */
  above: boolean;
  /** 아래로 가려진 내용이 있음 */
  below: boolean;
};

/**
 * 스크롤되는 영역의 위·아래에 가려진 내용이 있는지. 경계에 구분선을 그릴 때 씁니다.
 * 스크롤할 때, 영역이나 내용의 크기가 바뀔 때(창 높이, 안내 문구 등) 다시 확인합니다.
 */
export function useScrollEdges(ref: RefObject<HTMLElement | null>) {
  const [edges, setEdges] = useState<ScrollEdges>({
    above: false,
    below: false,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const above = el.scrollTop > 0;
      // 소수점 크기 때문에 끝까지 내려도 1px 남는 경우가 있어 여유를 둠
      const below = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
      setEdges((prev) =>
        prev.above === above && prev.below === below ? prev : { above, below },
      );
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    for (const child of el.children) observer.observe(child);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [ref]);

  return edges;
}
