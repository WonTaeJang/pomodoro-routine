"use client";

import { useState } from "react";
import {
  CheckIcon,
  CloseIcon,
  EditIcon,
  MedalIcon,
  MinusIcon,
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
  Badge,
  Button,
  Card,
  Checkbox,
  ConfirmDialog,
  Dialog,
  IconButton,
  ProgressRing,
  SegmentedControl,
  Section,
  Slider,
  Stepper,
  Switch,
  TextField,
} from "@/components/ui";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
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
  { name: "Minus", Icon: MinusIcon },
  { name: "Check", Icon: CheckIcon },
  { name: "Close", Icon: CloseIcon },
  { name: "Trash", Icon: TrashIcon },
  { name: "Edit", Icon: EditIcon },
  { name: "Sun", Icon: SunIcon },
  { name: "Moon", Icon: MoonIcon },
  { name: "Paw", Icon: PawIcon },
  { name: "Medal", Icon: MedalIcon },
];

/** 공통 컴포넌트를 한눈에 확인하는 개발용 페이지 */
export function Playground() {
  const [mode, setMode] = useState<Mode>("focus");
  const [running, setRunning] = useState(false);
  const [autoStart, setAutoStart] = useState(true);
  const [done, setDone] = useState(false);
  const [estimate, setEstimate] = useState(3);
  const [progress, setProgress] = useState(0.6);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [volume, setVolume] = useState(70);

  return (
    <main className={styles.page} data-mode={mode}>
      <header className={styles.header}>
        <h1 className={styles.title}>컴포넌트 미리보기</h1>
        <ThemeToggle />
      </header>

      <Section title="SegmentedControl · 모드를 바꾸면 강조색이 바뀝니다">
        <SegmentedControl
          label="타이머 모드"
          options={modeOptions}
          value={mode}
          onChange={setMode}
        />
      </Section>

      <Section title="Button">
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
      </Section>

      <Section title="IconButton · 타이머 조작 예시">
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
      </Section>

      <Section title="Badge">
        <div className={styles.row}>
          <Badge variant="solid" size="sm">
            집중 중
          </Badge>
          <Badge variant="medal" icon={<MedalIcon size={16} />}>
            오늘 1사이클 완료
          </Badge>
          <Badge variant="soft" size="lg" icon={<PawIcon size={16} />}>
            오늘 4개 · 100분
          </Badge>
          <Badge variant="outline">테스트 모드 · 5초</Badge>
        </div>
      </Section>

      <Section title="Card · ProgressRing">
        <div className={styles.row}>
          <Card className={styles.cardDemo}>
            <ProgressRing
              value={progress}
              size={120}
              markers={[0.25, 0.5]
                .filter((at) => 1 - progress >= at)
                .map((at) => ({
                  at,
                  content: <PawIcon size={14} className={styles.marker} />,
                }))}
            >
              <span className={styles.ringValue}>
                {Math.round(progress * 100)}%
              </span>
            </ProgressRing>
            <Stepper
              label="남은 비율"
              value={Math.round(progress * 10)}
              min={0}
              max={10}
              onChange={(v) => setProgress(v / 10)}
              format={(v) => `${v * 10}%`}
            />
          </Card>
        </div>
      </Section>

      <Section title="Switch · Checkbox · TextField · Stepper">
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
          <Stepper
            label="예상 뽀모도로 수"
            value={estimate}
            min={1}
            max={20}
            onChange={setEstimate}
            prefix={<PawIcon size={16} />}
          />
        </div>
      </Section>

      <Section title="Dialog">
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
      </Section>

      <Section title="Slider · ConfirmDialog">
        <div className={styles.stack}>
          <Slider
            label="소리 크기"
            value={volume}
            step={5}
            format={(v) => `${v}%`}
            onChange={setVolume}
          />
          <Slider label="꺼진 상태" value={40} onChange={() => {}} disabled />
        </div>
        <div className={styles.row}>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            확인 팝업 열기
          </Button>
        </div>
        <ConfirmDialog
          open={confirmOpen}
          title="모든 데이터를 지울까요?"
          confirmLabel="모두 지우기"
          tone="danger"
          onConfirm={() => {}}
          onClose={() => setConfirmOpen(false)}
        >
          지운 뒤에는 되돌릴 수 없어요.
        </ConfirmDialog>
      </Section>

      <Section title="Icons">
        <div className={styles.iconGrid}>
          {icons.map(({ name, Icon }) => (
            <div key={name} className={styles.iconCell}>
              <Icon size={24} />
              {name}
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
