"use client";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "use-intl";
import { LogInIcon, LogOutIcon } from "@/components/icons";
import { Button, TextField } from "@/components/ui";
import { formatDate } from "@/lib/date";
import { NICKNAME_MAX, profileOf } from "../profile";
import { signOut, updateNickname, useAuth } from "../session";
import { Avatar } from "./Avatar";
import styles from "./ProfileScreen.module.scss";
import { AuthCard } from "./AuthCard";
import page from "./AuthPage.module.scss";

/** 내 프로필 (/profile): 사진, 닉네임 바꾸기, 이메일, 로그인 방법, 가입한 날, 로그아웃 */
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
  const provider = profile.provider ?? "";
  // 이름을 아는 로그인 방법만 번역, 나머지는 그대로
  const providerName =
    provider === "google" || provider === "kakao"
      ? t(`providers.${provider}`)
      : provider;

  return (
    <>
      <div className={styles.identity}>
        <Avatar
          src={profile.avatarUrl}
          alt={t("avatarAlt", { name: profile.nickname })}
          size={72}
        />
        <div className={styles.names}>
          <p className={styles.nickname}>{profile.nickname}</p>
          {profile.email ? <p className={page.muted}>{profile.email}</p> : null}
        </div>
      </div>

      <NicknameForm
        initial={profile.customNickname ? profile.nickname : ""}
        placeholder={profile.nickname}
      />

      <dl className={styles.facts}>
        <div>
          <dt>{t("provider")}</dt>
          <dd>{providerName}</dd>
        </div>
        <div>
          <dt>{t("joined")}</dt>
          <dd>{formatDate(profile.createdAt, locale)}</dd>
        </div>
      </dl>

      <Button
        variant="secondary"
        icon={<LogOutIcon />}
        onClick={() => void signOut()}
        className={styles.logout}
      >
        {t("logout")}
      </Button>
    </>
  );
}

type NicknameFormProps = {
  /** 직접 정한 닉네임 (없으면 빈 값) */
  initial: string;
  /** 비워 두면 쓰는 이름 */
  placeholder: string;
};

function NicknameForm({ initial, placeholder }: NicknameFormProps) {
  const t = useTranslations("auth.profile");
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<
    "idle" | "saving" | "saved" | "tooLong" | "failed"
  >("idle");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("saving");
    const result = await updateNickname(value);
    setState(result.ok ? "saved" : result.reason);
  }

  const error =
    state === "tooLong" || state === "failed"
      ? t(`errors.${state}`, { max: NICKNAME_MAX })
      : undefined;

  return (
    <form className={styles.form} onSubmit={submit}>
      <TextField
        label={t("nickname")}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          setValue(e.target.value);
          setState("idle");
        }}
        hint={t("nicknameHint", { max: NICKNAME_MAX })}
        error={error}
        autoComplete="nickname"
        className={styles.field}
      />
      <Button
        type="submit"
        disabled={state === "saving" || value.trim() === initial}
        className={styles.save}
      >
        {t("save")}
      </Button>
      <p className={page.muted} role="status">
        {state === "saved" ? t("saved") : null}
      </p>
    </form>
  );
}
