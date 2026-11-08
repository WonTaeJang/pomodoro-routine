"use client";

import { useMemo, useState } from "react";
import { Button, Dialog, Switch } from "@/components/ui";
import { useHistoryStore } from "@/features/history/store";
import { useTasksStore } from "@/features/tasks/store";
import { useTimerStore } from "@/features/timer/store";
import { useHoldAutoPopups } from "@/lib/popupHold";
import { CERTIFICATE_TITLE, getCertificate } from "../certificate";
import { canShareFile, downloadFile, shareFile } from "../share";
import styles from "./CertificateDialog.module.scss";
import { useCertificateImage } from "./useCertificateImage";

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
  const canShare = current !== null && canShareFile(current.file);

  async function handleShare() {
    if (!current) return;
    const result = await shareFile(current.file, CERTIFICATE_TITLE);
    setShareFailed(result === "failed");
  }

  const status = failed
    ? "수료증을 만들지 못했어요. 다시 열어 주세요."
    : data
      ? "수료증을 만드는 중…"
      : "아직 완료한 사이클이 없어요.";
  const hint = shareFailed
    ? "공유하지 못했어요. 이미지를 저장해서 올려 주세요."
    : canShare
      ? "공유하기에서 인스타그램을 고르면 스토리에 올릴 수 있어요."
      : "이미지를 저장해서 인스타그램 스토리에 올려 보세요.";

  return (
    <Dialog
      open
      onClose={onClose}
      title={CERTIFICATE_TITLE}
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
            이미지 저장
          </Button>
          {canShare ? <Button onClick={handleShare}>공유하기</Button> : null}
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
              alt={`${CERTIFICATE_TITLE} 미리보기`}
              className={styles.image}
            />
          ) : null}
          {!current ? <p className={styles.status}>{status}</p> : null}
        </div>
        {data && data.taskTitles.length > 0 ? (
          <Switch
            label="할 일 보이기"
            description="이번 사이클에 한 할 일을 수료증에 넣어요"
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
