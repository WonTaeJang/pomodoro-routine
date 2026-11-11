/** 목록을 size개씩 나눕니다. (서버에 여러 줄을 나눠 올릴 때) */
export function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
