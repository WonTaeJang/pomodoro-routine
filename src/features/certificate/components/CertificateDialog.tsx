"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useTranslations } from "use-intl";
import { Button, Dialog, Switch } from "@/components/ui";
import { useHistoryStore } from "@/features/history/store";
import { useTasksStore } from "@/features/tasks/store";
import { useTimerStore } from "@/features/timer/store";
import { useHoldAutoPopups } from "@/lib/popupHold";
import { getCertificate } from "../certificate";
import { canShareImages, downloadFile, shareFile } from "../share";
import styles from "./CertificateDialog.module.scss";
import { useCertificateImage } from "./useCertificateImage";

/** 공유 지원 여부는 바뀌지 않으므로 구독할 것이 없음 */
const subscribeNever = () => () => {};

type CertificateDialogProps = {
  /** 몇 번째 사이클의 수료증인지 (제 N호). 없으면 가장 최근 사이클 */
  number?: number;
  onClose: () => void;
};

/**
 * 수료증 미리보기, 공유, 저장.
 * 열리자마자 이미지를 만들어 둡니다. (공유 창은 버튼을 누른 순간에만 열 수 있음)
 */
export function CertificateDialog({ number, onClose }: CertificateDialogProps) {
  // 수료증을 보는 중에 세션이 끝나도 완료 팝업이 덮지 않게
  useHoldAutoPopups();
  const sessions = useHistoryStore((s) => s.sessions);
  const tasks = useTasksStore((s) => s.tasks);
  const showTasks = useTimerStore((s) => s.settings.certificateShowTasks);
  const data = useMemo(
    () => getCertificate(sessions, tasks, number),
    [sessions, tasks, number],
  );
  const { preview, current, failed } = useCertificateImage(data, showTasks);
  const [shareFailed, setShareFailed] = useState(false);
  // 이미지가 나오기 전부터 정해 두어, 만드는 동안에도 버튼이 최종 모양 그대로 보이게 (B-006)
  const canShare = useSyncExternalStore(
    subscribeNever,
    canShareImages,
    () => false,
  );
  const t = useTranslations("certificate");
  const title = t("title");

  async function handleShare() {
    if (!current) return;
    const result = await shareFile(current.file, title);
    setShareFailed(result === "failed");
  }

  const status = t(
    failed ? "status.failed" : data ? "status.making" : "status.noCycle",
  );
  const hint = t(
    shareFailed ? "hint.shareFailed" : canShare ? "hint.share" : "hint.save",
  );

  return (
    <Dialog
      open
      onClose={onClose}
      title={title}
      className={styles.dialog}
      footer={
        <>
          <Button
            variant={canShare ? "secondary" : "primary"}
            disabled={!current}
            onClick={() =>
              current && downloadFile(current.url, current.file.name)
            }
          >
            {t("save")}
          </Button>
          {canShare ? (
            <Button disabled={!current} onClick={handleShare}>
              {t("share")}
            </Button>
          ) : null}
        </>
      }
    >
      <div className={styles.content}>
        <div className={styles.preview} aria-busy={!current}>
          {preview ? (
            // 만든 이미지를 그대로 보여주므로 next/image를 쓰지 않음
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.url}
              alt={t("preview", { title })}
              className={styles.image}
            />
          ) : null}
          {!current ? <p className={styles.status}>{status}</p> : null}
        </div>
        {data && data.taskTitles.length > 0 ? (
          <Switch
            label={t("showTasks.label")}
            description={t("showTasks.description")}
            checked={showTasks}
            onCheckedChange={(on) =>
              useTimerStore
                .getState()
                .updateSettings({ certificateShowTasks: on })
            }
          />
        ) : null}
        <p className={styles.hint}>{hint}</p>
      </div>
    </Dialog>
  );
}
