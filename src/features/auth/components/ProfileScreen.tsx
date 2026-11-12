"use client";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "use-intl";
import { EditIcon, LogInIcon, LogOutIcon } from "@/components/icons";
import {
  Badge,
  Button,
  ConfirmDialog,
  IconButton,
  TextField,
  VisuallyHidden,
} from "@/components/ui";
import { formatDate } from "@/lib/date";
import { NICKNAME_MAX, profileOf, type Profile } from "../profile";
import { deleteAccount, signOut, updateNickname, useAuth } from "../session";
import { Avatar } from "./Avatar";
import styles from "./ProfileScreen.module.scss";
import { AuthCard } from "./AuthCard";
import page from "./AuthPage.module.scss";

/** 내 프로필 (/profile): 사진, 닉네임(연필로 바꾸기), 이메일과 로그인 방법, 가입한 날, 로그아웃, 회원 탈퇴 */
export function ProfileScreen() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { status, user } = useAuth();

  return (
    <AuthCard title={t("profile.title")}>
      {status === "signedIn" && user ? (
        <ProfileDetails user={user} />
      ) : status === "loading" ? (
        <p role="status" className={page.muted}>
          {t("profile.loading")}
        </p>
      ) : status === "disabled" ? (
        <p className={page.error}>{t("login.notConfigured")}</p>
      ) : (
        <>
          <p>{t("profile.signedOut")}</p>
          <Button
            icon={<LogInIcon />}
            onClick={() => router.push("/login?next=/profile")}
          >
            {t("profile.login")}
          </Button>
        </>
      )}
    </AuthCard>
  );
}

function ProfileDetails({ user }: { user: User }) {
  const t = useTranslations("auth.profile");
  const locale = useLocale();
  const profile = profileOf(user);

  return (
    <>
      <div className={styles.identity}>
        <Avatar
          src={profile.avatarUrl}
          alt={t("avatarAlt", { name: profile.nickname })}
          size={72}
        />
        <div className={styles.names}>
          <Nickname profile={profile} />
          {profile.email ? <p className={page.muted}>{profile.email}</p> : null}
          <ProviderBadge provider={profile.provider} />
        </div>
      </div>

      <dl className={styles.facts}>
        <div>
          <dt>{t("joined")}</dt>
          <dd>{formatDate(profile.createdAt, locale)}</dd>
        </div>
      </dl>

      <AccountActions />
    </>
  );
}

/** 로그인 방법 배지 ("Google로 로그인"). 이름을 아는 방법만 번역하고 나머지는 그대로 */
function ProviderBadge({ provider }: { provider: string | null }) {
  const t = useTranslations("auth.profile");
  if (!provider) return null;
  const name =
    provider === "google" || provider === "kakao" || provider === "email"
      ? t(`providers.${provider}`)
      : provider;
  return (
    <Badge variant="soft" size="sm" className={styles.provider}>
      {t("signedInWith", { provider: name })}
    </Badge>
  );
}

/** 닉네임. 연필을 누르면 그 자리에서 입력칸으로 바뀌고, 저장하거나 취소하면 돌아옴 */
function Nickname({ profile }: { profile: Profile }) {
  const t = useTranslations("auth.profile");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const pencil = useRef<HTMLButtonElement>(null);
  // 고치기를 마치면 연필 버튼으로 포커스를 돌려줌 (키보드로 이어서 쓸 수 있게)
  const refocus = useRef(false);
  useEffect(() => {
    if (editing || !refocus.current) return;
    refocus.current = false;
    pencil.current?.focus();
  }, [editing]);

  return (
    <>
      {editing ? (
        <NicknameForm
          initial={profile.nickname}
          onDone={(changed) => {
            refocus.current = true;
            setEditing(false);
            setSaved(changed);
          }}
        />
      ) : (
        <div className={styles.nicknameRow}>
          <p className={styles.nickname}>{profile.nickname}</p>
          <IconButton
            ref={pencil}
            label={t("editNickname")}
            icon={<EditIcon size={16} />}
            size="sm"
            onClick={() => {
              setSaved(false);
              setEditing(true);
            }}
          />
        </div>
      )}
      {/* 바뀐 이름이 바로 보이므로 화면 낭독기에만 알림 */}
      <VisuallyHidden role="status">{saved ? t("saved") : null}</VisuallyHidden>
    </>
  );
}

type NicknameFormProps = {
  /** 지금 보이는 닉네임 */
  initial: string;
  /** 저장했거나(true) 취소했을 때(false) */
  onDone: (changed: boolean) => void;
};

function NicknameForm({ initial, onDone }: NicknameFormProps) {
  const t = useTranslations("auth.profile");
  const common = useTranslations("common");
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "tooLong" | "failed">(
    "idle",
  );

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("saving");
    const result = await updateNickname(value);
    if (result.ok) onDone(true);
    else setState(result.reason);
  }

  const error =
    state === "tooLong" || state === "failed"
      ? t(`errors.${state}`, { max: NICKNAME_MAX })
      : undefined;

  return (
    <form
      className={styles.form}
      onSubmit={submit}
      onKeyDown={(e) => {
        if (e.key === "Escape") onDone(false);
      }}
    >
      <TextField
        label={t("nickname")}
        hideLabel
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setState("idle");
        }}
        hint={t("nicknameHint", { max: NICKNAME_MAX })}
        error={error}
        autoComplete="nickname"
        autoFocus
      />
      <div className={styles.formActions}>
        <Button variant="ghost" size="sm" onClick={() => onDone(false)}>
          {common("cancel")}
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={state === "saving" || value.trim() === initial}
        >
          {t("save")}
        </Button>
      </div>
    </form>
  );
}

/** 아래 줄: 로그아웃(확인 팝업에서 지워지는 것 안내) | 회원 탈퇴(한 번 더 확인) */
function AccountActions() {
  const t = useTranslations("auth.profile");
  const del = useTranslations("auth.profile.deleteAccount");
  const router = useRouter();
  const [confirm, setConfirm] = useState<"logout" | "delete" | null>(null);
  const [deleting, setDeleting] = useState<"idle" | "working" | "failed">(
    "idle",
  );

  async function remove() {
    setDeleting("working");
    if (await deleteAccount()) router.replace("/");
    else setDeleting("failed");
  }

  return (
    <>
      <div className={styles.actions}>
        <Button
          variant="secondary"
          icon={<LogOutIcon />}
          onClick={() => setConfirm("logout")}
        >
          {t("logout")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={styles.deleteAccount}
          disabled={deleting === "working"}
          onClick={() => setConfirm("delete")}
        >
          {deleting === "working" ? del("working") : del("button")}
        </Button>
      </div>
      {deleting === "failed" ? (
        <p className={page.error} role="alert">
          {del("failed")}
        </p>
      ) : null}
      <ConfirmDialog
        open={confirm === "logout"}
        title={t("logoutTitle")}
        confirmLabel={t("logout")}
        onConfirm={() => void signOut()}
        onClose={() => setConfirm(null)}
      >
        {t("logoutNote")}
      </ConfirmDialog>
      <ConfirmDialog
        open={confirm === "delete"}
        title={del("title")}
        confirmLabel={del("action")}
        tone="danger"
        onConfirm={() => void remove()}
        onClose={() => setConfirm(null)}
      >
        {del("message")}
      </ConfirmDialog>
    </>
  );
}
