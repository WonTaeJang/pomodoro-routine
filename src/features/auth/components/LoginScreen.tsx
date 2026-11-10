"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "use-intl";
import { LogInIcon } from "@/components/icons";
import { Button } from "@/components/ui";
import { safeNextPath } from "../profile";
import { signInWithGoogle, useAuth } from "../session";
import { AuthCard } from "./AuthCard";
import styles from "./AuthPage.module.scss";

/**
 * 로그인 화면 (/login). 지금은 구글 로그인만. 로그인하지 않아도 모든 기능을 쓸 수 있음.
 * 주소에 ?next=/경로가 있으면 로그인 뒤 그곳으로, 없으면 프로필로 돌아감.
 */
export function LoginScreen() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const { status } = useAuth();
  const [state, setState] = useState<"idle" | "redirecting" | "failed">("idle");

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
            disabled={state === "redirecting" || status !== "signedOut"}
            onClick={loginWithGoogle}
          >
            {state === "redirecting" ? t("redirecting") : t("google")}
          </Button>
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
