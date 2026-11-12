const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 서버 표의 uuid 열에 넣을 수 있는 값인지 */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}
