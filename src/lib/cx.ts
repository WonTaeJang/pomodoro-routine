/** 조건에 따라 클래스 이름을 합칩니다. 예: cx(styles.a, active && styles.b) */
export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
