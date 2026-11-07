"use client";

import { useState } from "react";
import {
  CheckIcon,
  CloseIcon,
  EditIcon,
  MoonIcon,
  PauseIcon,
  PawIcon,
  PlayIcon,
  PlusIcon,
  ResetIcon,
  SettingsIcon,
  SkipIcon,
  SunIcon,
  TrashIcon,
} from "@/components/icons";
import {
  Button,
  Checkbox,
  Dialog,
  IconButton,
  SegmentedControl,
  Switch,
  TextField,
} from "@/components/ui";
import styles from "./Playground.module.scss";

type Mode = "focus" | "short-break" | "long-break";

const modeOptions: { value: Mode; label: string }[] = [
  { value: "focus", label: "집중" },
  { value: "short-break", label: "짧은 휴식" },
  { value: "long-break", label: "긴 휴식" },
];

const icons = [
  { name: "Play", Icon: PlayIcon },
  { name: "Pause", Icon: PauseIcon },
  { name: "Reset", Icon: ResetIcon },
  { name: "Skip", Icon: SkipIcon },
  { name: "Settings", Icon: SettingsIcon },
  { name: "Plus", Icon: PlusIcon },
  { name: "Check", Icon: CheckIcon },
  { name: "Close", Icon: CloseIcon },
  { name: "Trash", Icon: TrashIcon },
  { name: "Edit", Icon: EditIcon },
  { name: "Sun", Icon: SunIcon },
  { name: "Moon", Icon: MoonIcon },
  { name: "Paw", Icon: PawIcon },
];

export function Playground() {
  const [mode, setMode] = useState<Mode>("focus");
  const [dark, setDark] = useState(false);
  const [running, setRunning] = useState(false);
  const [autoStart, setAutoStart] = useState(true);
  const [done, setDone] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
  }

  return (
    <main className={styles.page} data-mode={mode}>
      <header className={styles.header}>
        <h1 className={styles.title}>컴포넌트 미리보기</h1>
        <IconButton
          label={dark ? "라이트 모드로 바꾸기" : "다크 모드로 바꾸기"}
          icon={dark ? <SunIcon /> : <MoonIcon />}
          variant="secondary"
          onClick={toggleTheme}
        />
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          SegmentedControl · 모드를 바꾸면 강조색이 바뀝니다
        </h2>
        <SegmentedControl
          label="타이머 모드"
          options={modeOptions}
          value={mode}
          onChange={setMode}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Button</h2>
        <div className={styles.row}>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger" icon={<TrashIcon size={18} />}>
            삭제
          </Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className={styles.row}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg" icon={<PlayIcon />}>
            시작
          </Button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>IconButton · 타이머 조작 예시</h2>
        <div className={styles.row}>
          <IconButton
            label="리셋"
            icon={<ResetIcon />}
            variant="secondary"
            size="lg"
          />
          <IconButton
            label={running ? "일시정지" : "시작"}
            icon={running ? <PauseIcon size={28} /> : <PlayIcon size={28} />}
            variant="primary"
            size="xl"
            onClick={() => setRunning(!running)}
          />
          <IconButton
            label="다음 세션"
            icon={<SkipIcon />}
            variant="secondary"
            size="lg"
          />
          <IconButton label="설정" icon={<SettingsIcon />} />
          <IconButton
            label="할 일 추가"
            icon={<PlusIcon />}
            size="sm"
            variant="secondary"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Switch · Checkbox · TextField</h2>
        <div className={styles.stack}>
          <Switch
            label="휴식 자동 시작"
            description="집중이 끝나면 휴식 타이머를 바로 시작해요"
            checked={autoStart}
            onCheckedChange={setAutoStart}
          />
          <Checkbox
            label="영어 단어 30개 외우기"
            checked={done}
            onChange={(e) => setDone(e.target.checked)}
          />
          <TextField label="할 일" placeholder="무엇에 집중할까요?" />
          <TextField
            label="집중 시간(분)"
            type="number"
            min={1}
            max={120}
            defaultValue={25}
            hint="1~120분"
          />
          <TextField
            label="긴 휴식 주기"
            type="number"
            defaultValue={0}
            error="1 이상이어야 해요"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Dialog</h2>
        <div className={styles.row}>
          <Button variant="secondary" onClick={() => setDialogOpen(true)}>
            완료 팝업 열기
          </Button>
        </div>
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="수고했어요!"
          footer={
            <>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                닫기
              </Button>
              <Button onClick={() => setDialogOpen(false)}>
                까미랑 산책 →
              </Button>
            </>
          }
        >
          뽀모도로 하나를 완료했어요. 5분 동안 쉬어요.
        </Dialog>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Icons</h2>
        <div className={styles.iconGrid}>
          {icons.map(({ name, Icon }) => (
            <div key={name} className={styles.iconCell}>
              <Icon size={24} />
              {name}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
