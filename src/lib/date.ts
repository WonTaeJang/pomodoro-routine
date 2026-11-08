/** 그날의 시작 시각(로컬 자정) */
export function startOfDay(time: number): number {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** 요일 이름 (Date.getDay() 순서: 일요일부터) */
export const WEEKDAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

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

const longDate = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "long",
});

/** "11월 8일 일요일" */
export function formatLongDate(time: number): string {
  return longDate.format(time);
}

/** "2026.11.07" */
export function formatDate(time: number): string {
  const d = new Date(time);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

/** 시간 길이를 "25분", "1시간 40분", "5초"처럼 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}초`;
  const totalMinutes = Math.round(totalSeconds / 60);
  if (totalMinutes < 60) return `${totalMinutes}분`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours}시간` : `${hours}시간 ${minutes}분`;
}
