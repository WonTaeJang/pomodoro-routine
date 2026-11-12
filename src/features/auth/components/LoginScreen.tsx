"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "use-intl";
import { LogInIcon } from "@/components/icons";
import { Button } from "@/components/ui";
import { safeNextPath } from "../profile";
import {
  isDevLoginAvailable,
  signInWithDevAccount,
  signInWithGoogle,
  useAuth,
} from "../session";
import { AuthCard } from "./AuthCard";
import styles from "./AuthPage.module.scss";

/**
 * 로그인 화면 (/login). 지금은 구글 로그인만. 로그인하지 않아도 모든 기능을 쓸 수 있음.
 * 개발 서버에서 테스트 계정 정보가 있으면 "테스트 계정으로 로그인"도 보임.
 * 주소에 ?next=/경로가 있으면 로그인 뒤 그곳으로, 없으면 프로필로 돌아감.
 */
export function LoginScreen() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const { status } = useAuth();
  const [state, setState] = useState<
    "idle" | "redirecting" | "signingIn" | "failed"
  >("idle");

  // 이미 로그인했으면 프로필로
  useEffect(() => {
    if (status === "signedIn") router.replace("/profile");
  }, [status, router]);

  async function loginWithGoogle() {
    setState("redirecting");
    const next = new URLSearchParams(window.location.search).get("next");
    const started = await signInWithGoogle(safeNextPath(next));
    // 성공하면 구글로 이동하므로 이 화면에 머무르는 것은 실패했을 때뿐
    if (!started) setState("failed");
  }

  async function loginWithDevAccount() {
    setState("signingIn");
    // 성공하면 로그인 상태가 바뀌어 위에서 프로필로 이동
    if (!(await signInWithDevAccount())) setState("failed");
  }

  const busy =
    state === "redirecting" || state === "signingIn" || status !== "signedOut";

  return (
    <AuthCard title={t("title")}>
      <p>{t("intro")}</p>
      {status === "disabled" ? (
        <p className={styles.error} role="alert">
          {t("notConfigured")}
        </p>
      ) : (
        <>
          <Button
            variant="secondary"
            fullWidth
            icon={<LogInIcon />}
            disabled={busy}
            onClick={loginWithGoogle}
          >
            {state === "redirecting" ? t("redirecting") : t("google")}
          </Button>
          {isDevLoginAvailable ? (
            <Button
              variant="ghost"
              fullWidth
              disabled={busy}
              onClick={loginWithDevAccount}
            >
              {t("devAccount")}
            </Button>
          ) : null}
          {state === "failed" ? (
            <p className={styles.error} role="alert">
              {t("failed")}
            </p>
          ) : null}
        </>
      )}
      <p className={styles.muted}>{t("note")}</p>
    </AuthCard>
  );
}
