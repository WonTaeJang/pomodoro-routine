/** 이 브라우저가 이미지 파일을 공유 창으로 보낼 수 있는지 (주로 휴대폰) */
export function canShareFile(file: File): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  );
}

/**
 * 공유 창을 엽니다. 사용자가 공유 창을 닫으면 "cancelled".
 * 아이폰 사파리는 버튼을 누른 순간에만 열 수 있으므로, 파일은 미리 만들어 두고 바로 불러야 합니다.
 */
export async function shareFile(
  file: File,
  title: string,
): Promise<"shared" | "cancelled" | "failed"> {
  try {
    await navigator.share({ files: [file], title });
    return "shared";
  } catch (error) {
    return error instanceof DOMException && error.name === "AbortError"
      ? "cancelled"
      : "failed";
  }
}

/** 파일을 내려받습니다. */
export function downloadFile(url: string, fileName: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
}
