import kkamiDone from "@/assets/kkami/kkami-done.webp";
import { ALERT_MESSAGES, type AlertKind } from "./alerts";

/** 이 브라우저가 알림을 지원하는지 */
function supported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export type NotificationStatus = NotificationPermission | "unsupported";

/** 지금 알림 권한 상태 (허용 / 차단 / 아직 묻지 않음 / 지원 안 함) */
export function getNotificationStatus(): NotificationStatus {
  return supported() ? Notification.permission : "unsupported";
}

/** 아직 묻지 않았으면 알림 권한을 묻습니다. 사용자가 버튼을 누를 때 불러야 합니다. */
export async function requestNotificationPermission(): Promise<NotificationStatus> {
  if (!supported()) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    // 옛 사파리는 결과를 돌려주지 않으므로 현재 값으로 대신함
    return (await Notification.requestPermission()) ?? Notification.permission;
  } catch {
    return Notification.permission;
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
