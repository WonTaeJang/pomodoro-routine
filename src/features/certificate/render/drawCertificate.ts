import mascot from "@/assets/mascot/kkami-graduate.svg";
import { APP_NAME } from "@/lib/brand";
import { formatDate, formatDuration, startOfDay } from "@/lib/date";
import { seededRandom } from "@/lib/random";
import {
  CERTIFICATE_TITLE,
  getCertificateMessage,
  type CertificateData,
} from "../certificate";
import {
  drawCircleText,
  drawPaw,
  drawSpacedText,
  drawText,
  ellipsize,
  loadImage,
  roundRectPath,
  setFont,
  type Ctx,
} from "./canvas";
import { CENTER_X, COLOR, LAYOUT, SIZE } from "./layout";

type CertificateOptions = {
  /** 이번 사이클에 한 할 일을 보여줄지 */
  showTasks: boolean;
};

/** 수료증을 그려서 PNG로 돌려줍니다. 브라우저에서만 동작합니다. 크기와 위치는 layout.ts */
export async function renderCertificate(
  data: CertificateData,
  options: CertificateOptions,
): Promise<Blob> {
  const family = await loadFont();
  const image = await loadImage(
    typeof mascot === "string" ? mascot : mascot.src,
  );

  const canvas = document.createElement("canvas");
  canvas.width = SIZE.width;
  canvas.height = SIZE.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("캔버스를 쓸 수 없어요");

  drawBackground(ctx, data.number);
  drawHeader(ctx, family);
  drawCard(ctx);
  drawMascot(ctx, image);
  drawTitle(ctx, family, data);
  drawStats(ctx, family, data);
  if (options.showTasks && data.taskTitles.length > 0) {
    drawTasks(ctx, family, data.taskTitles);
  } else {
    drawNoTasks(ctx, family, data.taskTitles.length > 0);
  }
  drawStamp(ctx, family);
  drawBrand(ctx, family);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("이미지를 만들지 못했어요")),
      "image/png",
    );
  });
}

/**
 * 앱 글꼴(Pretendard)을 불러와서 캔버스에서 쓸 이름을 돌려줍니다.
 * 이름 목록에는 대체 글꼴(Arial 기반)도 들어 있어서, 그 글꼴이 없는 기기에서는 불러오기가 실패할 수 있음
 * → 실패해도 있는 글꼴로 그림
 */
async function loadFont(): Promise<string> {
  const family =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-pretendard")
      .trim() || "sans-serif";
  await Promise.allSettled(
    [500, 600, 700, 800, 900].map((weight) =>
      document.fonts.load(`${weight} 40px ${family}`, "까모도로 수료증 0123"),
    ),
  );
  return family;
}

/** 그라데이션 배경과 색종이 (카드 바깥에만, 수료증 번호마다 다른 배치) */
function drawBackground(ctx: Ctx, seed: number) {
  const { width: W, height: H } = SIZE;
  // CSS linear-gradient(160deg, ...)와 같은 방향
  const angle = (160 * Math.PI) / 180;
  const dx = Math.sin(angle);
  const dy = -Math.cos(angle);
  const half = (Math.abs(W * dx) + Math.abs(H * dy)) / 2;
  const gradient = ctx.createLinearGradient(
    W / 2 - dx * half,
    H / 2 - dy * half,
    W / 2 + dx * half,
    H / 2 + dy * half,
  );
  [0, 0.45, 1].forEach((at, i) =>
    gradient.addColorStop(at, COLOR.background[i]),
  );
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  const { card } = LAYOUT;
  const random = seededRandom(seed * 7919);
  ctx.save();
  ctx.globalAlpha = 0.9;
  for (let i = 0; i < 90; i++) {
    const x = random() * W;
    const y = random() * H;
    const nearCard =
      x > card.x - 10 &&
      x < card.x + card.w + 10 &&
      y > LAYOUT.confettiFreeTop &&
      y < card.y + card.h + 20;
    if (nearCard) continue;
    const kind = random();
    ctx.fillStyle =
      COLOR.confetti[Math.floor(random() * COLOR.confetti.length)];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(random() * Math.PI);
    if (kind < 0.25) {
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const [w, h] = kind < 0.6 ? [18, 36] : [14, 30];
      roundRectPath(ctx, -w / 2, -h / 2, w, h, 4);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawHeader(ctx: Ctx, family: string) {
  const { titleY, subtitleY } = LAYOUT.header;
  drawText(ctx, family, "한 사이클 완료!", CENTER_X, titleY, {
    size: 44,
    weight: 800,
    color: COLOR.white,
    align: "center",
    baseline: "top",
  });
  ctx.save();
  ctx.globalAlpha = 0.85;
  setFont(ctx, family, 30, 600);
  drawSpacedText(ctx, "KKAMODORO CERTIFICATE", CENTER_X, subtitleY, 6);
  ctx.restore();
}

function drawCard(ctx: Ctx) {
  const { x, y, w, h, r } = LAYOUT.card;
  ctx.save();
  ctx.shadowColor = COLOR.cardShadow;
  ctx.shadowBlur = 80;
  ctx.shadowOffsetY = 30;
  ctx.fillStyle = COLOR.card;
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.restore();
}

function drawMascot(ctx: Ctx, image: HTMLImageElement) {
  const { cx, cy, r } = LAYOUT.halo;
  const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  halo.addColorStop(0, `rgba(${COLOR.halo}, 0.85)`);
  halo.addColorStop(0.65, `rgba(${COLOR.halo}, 0)`);
  ctx.fillStyle = halo;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  const { x, y, w, h } = LAYOUT.mascot;
  ctx.drawImage(image, x, y, w, h);
}

/** 번호·날짜 배지, 제목, 본문 */
function drawTitle(ctx: Ctx, family: string, data: CertificateData) {
  const badge = `제 ${data.number}호 · ${formatDate(data.completedAt)}`;
  const { y: badgeY, h: badgeH } = LAYOUT.badge;
  setFont(ctx, family, 28, 800);
  const badgeW = ctx.measureText(badge).width + 52;
  ctx.fillStyle = COLOR.ink;
  roundRectPath(ctx, CENTER_X - badgeW / 2, badgeY, badgeW, badgeH, badgeH / 2);
  ctx.fill();
  drawText(ctx, family, badge, CENTER_X, badgeY + badgeH / 2 + 1, {
    size: 28,
    weight: 800,
    color: COLOR.gold,
    align: "center",
  });

  drawText(ctx, family, CERTIFICATE_TITLE, CENTER_X, LAYOUT.title.y, {
    size: 104,
    weight: 900,
    color: COLOR.ink,
    align: "center",
    baseline: "top",
    fitWidth: LAYOUT.title.maxWidth,
  });

  const { y, lineHeight } = LAYOUT.message;
  getCertificateMessage(data).forEach((line, i) => {
    drawText(ctx, family, line, CENTER_X, y + i * lineHeight, {
      size: 38,
      weight: 500,
      color: COLOR.body,
      align: "center",
      baseline: "top",
    });
  });
}

/** 숫자 칸 3개: 집중한 시간 / 뽀모도로 / 오늘(지난 사이클이면 이날) 완료 */
function drawStats(ctx: Ctx, family: string, data: CertificateData) {
  const today = startOfDay(Date.now()) === startOfDay(data.completedAt);
  const stats = [
    [formatDuration(data.focusTotalMs), "집중한 시간"],
    [`${data.focusCount}번`, "뽀모도로"],
    [`${data.cyclesThatDay}사이클`, today ? "오늘 완료" : "이날 완료"],
  ];
  const { x: left, y: top, w: total, h, gap } = LAYOUT.stats;
  const w = (total - gap * (stats.length - 1)) / stats.length;
  stats.forEach(([value, label], i) => {
    const x = left + i * (w + gap);
    ctx.fillStyle = COLOR.statBg;
    roundRectPath(ctx, x, top, w, h, 28);
    ctx.fill();
    drawText(ctx, family, value, x + w / 2, top + 54, {
      size: 50,
      weight: 900,
      color: COLOR.accent,
      align: "center",
      fitWidth: w - 24,
    });
    drawText(ctx, family, label, x + w / 2, top + 104, {
      size: 27,
      weight: 600,
      color: COLOR.muted,
      align: "center",
    });
  });
}

function drawTasks(ctx: Ctx, family: string, titles: string[]) {
  const { x, labelY, firstY, lineHeight, max, maxWidth } = LAYOUT.tasks;
  drawText(ctx, family, "이번 사이클에 한 일", x, labelY, {
    size: 28,
    weight: 700,
    color: COLOR.faint,
  });

  const textX = x + 46;
  const shown = titles.slice(0, max);
  shown.forEach((title, i) => {
    const y = firstY + i * lineHeight;
    drawPaw(ctx, x + 15, y, 30, COLOR.paw);
    setFont(ctx, family, 35, 600);
    drawText(ctx, family, ellipsize(ctx, title, maxWidth), textX, y, {
      size: 35,
      weight: 600,
      color: COLOR.task,
    });
  });
  const rest = titles.length - shown.length;
  if (rest > 0) {
    drawText(
      ctx,
      family,
      `그 밖에 ${rest}개`,
      textX,
      firstY + max * lineHeight - 6,
      { size: 28, weight: 600, color: COLOR.faint },
    );
  }
}

/** 할 일이 없거나 숨겼을 때 */
function drawNoTasks(ctx: Ctx, family: string, hidden: boolean) {
  const text = hidden
    ? "오늘도 한 걸음 성장했어요"
    : "할 일 없이 오롯이 집중했어요";
  drawText(ctx, family, text, LAYOUT.tasks.x, LAYOUT.noTasksY, {
    size: 36,
    weight: 600,
    color: COLOR.body,
  });
}

/** 빨간 "까미 인증" 원형 도장 */
function drawStamp(ctx: Ctx, family: string) {
  const r = LAYOUT.stamp.size / 2;
  ctx.save();
  ctx.translate(LAYOUT.stamp.x + r, LAYOUT.stamp.y + r);
  ctx.rotate((-10 * Math.PI) / 180);
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = COLOR.stamp;
  ctx.fillStyle = COLOR.stamp;
  for (const [radius, width] of [
    [108, 7],
    [96, 2.5],
  ]) {
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  setFont(ctx, family, 22, 800);
  drawCircleText(
    ctx,
    "KKAMODORO · CERTIFIED · KKAMODORO · CERTIFIED ·",
    0,
    0,
    82,
  );
  drawPaw(ctx, 0, -10, 83, COLOR.stamp);
  drawText(ctx, family, "까미 인증", 0, 47, {
    size: 26,
    weight: 900,
    color: COLOR.stamp,
    align: "center",
  });
  ctx.restore();
}

/** 맨 아래 발자국 + 까모도로 */
function drawBrand(ctx: Ctx, family: string) {
  const { y, pawSize } = LAYOUT.brand;
  setFont(ctx, family, 40, 900);
  const gap = 12;
  const x = CENTER_X - (pawSize + gap + ctx.measureText(APP_NAME).width) / 2;
  drawPaw(ctx, x + pawSize / 2, y, pawSize, COLOR.white);
  drawText(ctx, family, APP_NAME, x + pawSize + gap, y + 2, {
    size: 40,
    weight: 900,
    color: COLOR.white,
  });
}
