// 캔버스 그리기 도우미 (수료증 전용)

export type Ctx = CanvasRenderingContext2D;

/** 같은 seed면 항상 같은 순서로 0~1 값을 내는 난수 (색종이 위치를 고정하기 위해) */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

/** 둥근 사각형 경로 */
export function roundRectPath(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function setFont(
  ctx: Ctx,
  family: string,
  size: number,
  weight: number,
) {
  ctx.font = `${weight} ${size}px ${family}`;
}

type TextStyle = {
  size: number;
  weight: number;
  color: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  /** 이 폭을 넘으면 글자 크기를 줄임 */
  fitWidth?: number;
};

/** 글자 하나를 스타일대로 씁니다. (글꼴, 색, 정렬을 매번 맞추는 반복을 줄이기 위함) */
export function drawText(
  ctx: Ctx,
  family: string,
  text: string,
  x: number,
  y: number,
  style: TextStyle,
) {
  ctx.fillStyle = style.color;
  ctx.textAlign = style.align ?? "left";
  ctx.textBaseline = style.baseline ?? "middle";
  if (style.fitWidth) {
    fitFont(ctx, family, text, style.fitWidth, style.size, style.weight);
  } else {
    setFont(ctx, family, style.size, style.weight);
  }
  ctx.fillText(text, x, y);
}

/** 폭 안에 들어갈 때까지 글자 크기를 줄입니다. 정한 글자 크기를 돌려줌 */
function fitFont(
  ctx: Ctx,
  family: string,
  text: string,
  maxWidth: number,
  size: number,
  weight: number,
  minSize = size * 0.6,
): number {
  let current = size;
  setFont(ctx, family, current, weight);
  while (current > minSize && ctx.measureText(text).width > maxWidth) {
    current -= 2;
    setFont(ctx, family, current, weight);
  }
  return current;
}

/** 폭을 넘으면 뒤를 "…"로 줄입니다. (지금 설정된 글꼴 기준) */
export function ellipsize(ctx: Ctx, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  const chars = [...text];
  while (
    chars.length > 0 &&
    ctx.measureText(`${chars.join("")}…`).width > maxWidth
  ) {
    chars.pop();
  }
  return `${chars.join("").trimEnd()}…`;
}

/** 글자 사이를 띄워서 가운데 정렬로 씁니다. (canvas letterSpacing을 지원하지 않는 브라우저 대비) */
export function drawSpacedText(
  ctx: Ctx,
  text: string,
  centerX: number,
  y: number,
  spacing: number,
) {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total =
    widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let x = centerX - total / 2;
  const align = ctx.textAlign;
  ctx.textAlign = "left";
  chars.forEach((c, i) => {
    ctx.fillText(c, x, y);
    x += widths[i] + spacing;
  });
  ctx.textAlign = align;
}

/** 원을 따라 글자를 한 바퀴 고르게 씁니다. 왼쪽(9시)에서 시작해 시계 방향 */
export function drawCircleText(
  ctx: Ctx,
  text: string,
  cx: number,
  cy: number,
  radius: number,
) {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const textWidth = widths.reduce((a, b) => a + b, 0);
  // 남는 둘레를 글자 사이에 똑같이 나눔
  const spacing = (2 * Math.PI * radius - textWidth) / chars.length;
  let angle = Math.PI;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  chars.forEach((c, i) => {
    angle += widths[i] / 2 / radius;
    ctx.save();
    ctx.translate(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(c, 0, 0);
    ctx.restore();
    angle += (widths[i] / 2 + spacing) / radius;
  });
  ctx.restore();
}

/** 발자국. (cx, cy) 중심, size는 높이(px) */
export function drawPaw(
  ctx: Ctx,
  cx: number,
  cy: number,
  size: number,
  color: string,
) {
  const s = size / 26;
  const shapes: [number, number, number, number][] = [
    [0, 4, 7.4, 6],
    [-7.4, -3, 2.7, 3.4],
    [-2.9, -7.4, 2.7, 3.4],
    [2.9, -7.4, 2.7, 3.4],
    [7.4, -3, 2.7, 3.4],
  ];
  ctx.save();
  ctx.fillStyle = color;
  for (const [x, y, rx, ry] of shapes) {
    ctx.beginPath();
    ctx.ellipse(
      cx + x * s,
      cy + (y + 1) * s,
      rx * s,
      ry * s,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();
}

/** 이미지를 불러옵니다. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error(`이미지를 불러오지 못했어요: ${src}`));
    image.src = src;
  });
}
