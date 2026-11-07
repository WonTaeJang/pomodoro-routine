"use client";

import { useState, type FormEvent } from "react";
import { PawIcon } from "@/components/icons";
import { Button, Stepper, TextField } from "@/components/ui";
import { cx } from "@/lib/cx";
import { ESTIMATE_MAX, ESTIMATE_MIN, TITLE_MAX_LENGTH } from "../tasks";
import styles from "./TaskForm.module.scss";

type TaskFormProps = {
  initialTitle?: string;
  initialEstimate?: number;
  submitLabel: string;
  onSubmit: (title: string, estimate: number) => void;
  /** 있으면 취소 버튼을 보여주고, ESC로도 취소 */
  onCancel?: () => void;
  /** 추가 후 입력칸 비우기 */
  resetOnSubmit?: boolean;
  autoFocus?: boolean;
  className?: string;
};

/** 할 일 추가, 수정에 같이 쓰는 입력 폼 */
export function TaskForm({
  initialTitle = "",
  initialEstimate = 1,
  submitLabel,
  onSubmit,
  onCancel,
  resetOnSubmit = false,
  autoFocus = false,
  className,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [estimate, setEstimate] = useState(initialEstimate);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    onSubmit(title, estimate);
    if (resetOnSubmit) {
      setTitle("");
      setEstimate(1);
    }
  }

  return (
    <form
      className={cx(styles.form, className)}
      onSubmit={handleSubmit}
      onKeyDown={(event) => {
        if (event.key === "Escape" && onCancel) onCancel();
      }}
    >
      <TextField
        label="할 일"
        hideLabel
        placeholder="무엇에 집중할까요?"
        value={title}
        maxLength={TITLE_MAX_LENGTH}
        autoFocus={autoFocus}
        onChange={(event) => setTitle(event.target.value)}
        className={styles.title}
      />
      <div className={styles.actions}>
        <Stepper
          label="예상 뽀모도로 수"
          value={estimate}
          min={ESTIMATE_MIN}
          max={ESTIMATE_MAX}
          onChange={setEstimate}
          prefix={<PawIcon size={16} />}
        />
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel}>
            취소
          </Button>
        ) : null}
        <Button type="submit" variant="secondary" disabled={!title.trim()}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
