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
  signInWithOAuth,
  useAuth,
  type OAuthProvider,
} from "../session";
import { AuthCard } from "./AuthCard";
import styles from "./AuthPage.module.scss";

/**
 * 로그인 화면 (/login). 구글·카카오 로그인. 로그인하지 않아도 모든 기능을 쓸 수 있음.
 * 개발 서버에서 테스트 계정 정보가 있으면 "테스트 계정으로 로그인"도 보임.
 * 주소에 ?next=/경로가 있으면 로그인 뒤 그곳으로, 없으면 프로필로 돌아감.
 */
export function LoginScreen() {
  const t = useTranslations("auth.login");
  const providerName = useTranslations("auth.profile.providers");
  const router = useRouter();
  const { status } = useAuth();
  const [state, setState] = useState<"idle" | "signingIn" | "failed">("idle");
  /** 구글·카카오로 이동하는 중이면 그 로그인 방법 */
  const [redirecting, setRedirecting] = useState<OAuthProvider | null>(null);

  // 이미 로그인했으면 프로필로
  useEffect(() => {
    if (status === "signedIn") router.replace("/profile");
  }, [status, router]);

  async function loginWith(provider: OAuthProvider) {
    setRedirecting(provider);
    setState("idle");
    const next = new URLSearchParams(window.location.search).get("next");
    const started = await signInWithOAuth(provider, safeNextPath(next));
    // 성공하면 구글·카카오로 이동하므로 이 화면에 머무르는 것은 실패했을 때뿐
    if (!started) {
      setRedirecting(null);
      setState("failed");
    }
  }

  /** 로그인 방법 버튼 문구. 이동하는 중이면 "…로 이동하는 중" */
  const label = (provider: OAuthProvider) =>
    redirecting === provider
      ? t("redirecting", { provider: providerName(provider) })
      : t(provider);

  async function loginWithDevAccount() {
    setState("signingIn");
    // 성공하면 로그인 상태가 바뀌어 위에서 프로필로 이동
    if (!(await signInWithDevAccount())) setState("failed");
  }

  const busy =
    redirecting !== null || state === "signingIn" || status !== "signedOut";

  return (
    <AuthCard title={t("title")}>
      <p>{t("intro")}</p>
      {status === "disabled" ? (
        <p className={styles.error} role="alert">
          {t("notConfigured")}
        </p>
      ) : (
        <>
          <div className={styles.providers}>
            <Button
              variant="secondary"
              fullWidth
              icon={<LogInIcon />}
              disabled={busy}
              onClick={() => void loginWith("google")}
            >
              {label("google")}
            </Button>
            <Button
              variant="secondary"
              fullWidth
              icon={<LogInIcon />}
              className={styles.kakao}
              disabled={busy}
              onClick={() => void loginWith("kakao")}
            >
              {label("kakao")}
            </Button>
          </div>
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
