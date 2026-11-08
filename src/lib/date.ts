/** 그날의 시작 시각(로컬 자정) */
export function startOfDay(time: number): number {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** 그날이 속한 달의 첫날 (로컬 자정) */
export function startOfMonth(time: number): number {
  const date = new Date(time);
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
}

/** n일 뒤(앞이면 음수) 같은 시각. 서머타임이 있어도 날짜 기준으로 셈 */
export function addDays(time: number, days: number): number {
  const date = new Date(time);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

/*
 * 아래 형식 함수는 화면 언어(locale: "ko", "en")를 받아 그 언어의 표기로 만듭니다.
 * 같은 형식기를 매번 새로 만들지 않게 언어별로 한 번만 만들어 둡니다.
 */
const dateFormats = new Map<string, Intl.DateTimeFormat>();
const unitFormats = new Map<string, Intl.NumberFormat>();

/** 같은 열쇠로 만든 것이 있으면 그것을, 없으면 만들어 두고 돌려줌 */
function cached<T>(cache: Map<string, T>, key: string, create: () => T): T {
  let value = cache.get(key);
  if (value === undefined) {
    value = create();
    cache.set(key, value);
  }
  return value;
}

function dateFormat(locale: string, options: Intl.DateTimeFormatOptions) {
  return cached(
    dateFormats,
    `${locale}:${JSON.stringify(options)}`,
    () => new Intl.DateTimeFormat(locale, options),
  );
}

function unitFormat(locale: string, unit: "second" | "minute" | "hour") {
  return cached(
    unitFormats,
    `${locale}:${unit}`,
    () =>
      new Intl.NumberFormat(locale, {
        style: "unit",
        unit,
        unitDisplay: "short",
      }),
  );
}

/** 요일 짧은 이름. Date.getDay() 순서: 일요일부터 ("일", "월"… / "Sun", "Mon"…) */
export function weekdayNames(locale: string): string[] {
  const format = dateFormat(locale, { weekday: "short" });
  // 2026년 11월 1일이 일요일
  return Array.from({ length: 7 }, (_, i) =>
    format.format(new Date(2026, 10, 1 + i)),
  );
}

/** "11월 8일 일요일" / "Sunday, November 8" */
export function formatLongDate(time: number, locale: string): string {
  return dateFormat(locale, {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(time);
}

/** 달력 제목: "2026년 11월" / "November 2026" (month는 0부터) */
export function formatMonth(year: number, month: number, locale: string) {
  return dateFormat(locale, { year: "numeric", month: "long" }).format(
    new Date(year, month, 1),
  );
}

/** 수료증 날짜: "2026.11.07" / "Nov 7, 2026" */
export function formatDate(time: number, locale: string): string {
  if (locale !== "ko") {
    return dateFormat(locale, { dateStyle: "medium" }).format(time);
  }
  const d = new Date(time);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

/** 시간 길이: "25분", "1시간 40분", "5초" / "25 min", "1 hr 40 min", "5 sec" */
export function formatDuration(ms: number, locale: string): string {
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60)
    return unitFormat(locale, "second").format(totalSeconds);
  const totalMinutes = Math.round(totalSeconds / 60);
  const minutes = unitFormat(locale, "minute");
  if (totalMinutes < 60) return minutes.format(totalMinutes);
  const hours = unitFormat(locale, "hour").format(
    Math.floor(totalMinutes / 60),
  );
  const rest = totalMinutes % 60;
  return rest === 0 ? hours : `${hours} ${minutes.format(rest)}`;
}
