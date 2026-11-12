// 앱 값과 서버 표의 값을 서로 바꿀 때 같이 쓰는 것

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 서버 표의 uuid 열에 넣을 수 있는 값인지 */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

/** 앱의 시각(epoch ms) → 표의 시각(ISO 문자열) */
export const toIso = <T extends number | null>(ms: T) =>
  (ms === null ? null : new Date(ms).toISOString()) as T extends number
    ? string
    : string | null;

/** 표의 시각 → 앱의 시각. 읽을 수 없으면 NaN */
export const fromIso = <T extends string | null>(value: T) =>
  (value === null ? null : Date.parse(value)) as T extends string
    ? number
    : number | null;
