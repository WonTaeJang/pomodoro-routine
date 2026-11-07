import kkamiDone from "@/assets/kkami/kkami-done.webp";
import { ALERT_MESSAGES, type AlertKind } from "./alerts";

/** 이 브라우저가 알림을 지원하는지 */
function supported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/** 아직 묻지 않았으면 알림 권한을 묻습니다. 사용자가 버튼을 누를 때 불러야 합니다. */
export function requestNotificationPermission() {
  if (supported() && Notification.permission === "default") {
    void Notification.requestPermission();
  }
}

/** 브라우저 알림을 띄웁니다. 권한이 없거나 지원하지 않으면 아무것도 하지 않습니다. */
export function showNotification(kind: AlertKind) {
  if (!supported() || Notification.permission !== "granted") return;
  const { title, body } = ALERT_MESSAGES[kind];
  try {
    const notification = new Notification(title, {
      body,
      icon: kkamiDone.src,
      // 같은 tag면 이전 알림을 새 알림이 대신함 (알림이 쌓이지 않게)
      tag: "kkamodoro-session",
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch {
    // 안드로이드 크롬은 서비스 워커로만 알림을 띄울 수 있음 (PWA 단계에서 지원)
  }
}
