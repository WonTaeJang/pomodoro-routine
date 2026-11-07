/**
 * 수료증 이미지의 크기, 색, 위치 (인스타 스토리 1080×1920, "축하 카드" 디자인).
 * 스토리 위아래 약 250px는 인스타 화면에 가려지므로 중요한 내용은 그 안쪽에 둡니다.
 * 위치는 위에서부터 차례로 적었고, 단위는 px입니다.
 */

export const SIZE = { width: 1080, height: 1920 };
export const CENTER_X = SIZE.width / 2;

export const COLOR = {
  background: ["#ff7a59", "#f2546b", "#c54b8c"],
  confetti: ["#f5c542", "#ff8fb1", "#7cc6ff", "#7be0b5", "#ffffff"],
  white: "#ffffff",
  card: "#fffaf5",
  cardShadow: "rgba(80, 0, 40, 0.35)",
  halo: "255, 240, 180",
  ink: "#2a2320",
  body: "#6a5d55",
  muted: "#8a7a6e",
  faint: "#a08e80",
  task: "#3d332d",
  accent: "#f2546b",
  paw: "#e5533d",
  statBg: "#fff0ea",
  gold: "#f5c542",
  stamp: "#d6453a",
};

export const LAYOUT = {
  /** "한 사이클 완료!" / "KKAMODORO CERTIFICATE" */
  header: { titleY: 250, subtitleY: 312 },
  /** 이 높이 아래의 카드 둘레에는 색종이를 뿌리지 않음 */
  confettiFreeTop: 330,
  mascot: { x: 340, y: 360, w: 400, h: 494 },
  /** 까미 뒤의 은은한 빛 */
  halo: { cx: 540, cy: 660, r: 260 },
  card: { x: 90, y: 560, w: 900, h: 1140, r: 56 },
  /** "제 12호 · 2026.11.07" */
  badge: { y: 866, h: 50 },
  title: { y: 920, maxWidth: 820 },
  message: { y: 1070, lineHeight: 61 },
  stats: { x: 150, y: 1210, w: 780, h: 140, gap: 20 },
  tasks: {
    x: 160,
    labelY: 1412,
    firstY: 1470,
    lineHeight: 58,
    max: 3,
    maxWidth: 520,
  },
  /** 할 일이 없거나 숨겼을 때의 한 줄 */
  noTasksY: 1462,
  stamp: { x: 730, y: 1385, size: 230 },
  brand: { y: 1776, pawSize: 44 },
};
