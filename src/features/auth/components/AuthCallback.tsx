"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "use-intl";
import { safeNextPath } from "../profile";
import { finishSignIn } from "../session";
import { AuthCard } from "./AuthCard";
import styles from "./AuthPage.module.scss";

/**
 * 구글 등에서 로그인하고 돌아오는 화면 (/auth/callback).
 * 주소의 code로 로그인을 마치고 next로 이동합니다. 취소했거나 실패하면 다시 로그인 버튼.
 */
export function AuthCallback() {
  const t = useTranslations("auth.callback");
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    // 로그인 화면에서 취소하면 code 대신 error가 옴
    const signedIn =
      code && !params.has("error")
        ? finishSignIn(code)
        : Promise.resolve(false);
    let active = true;
    void signedIn.then((ok) => {
      if (!active) return;
      if (ok) router.replace(safeNextPath(params.get("next")));
      else setFailed(true);
    });
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <AuthCard>
      {failed ? (
        <>
          <p className={styles.error} role="alert">
            {t("failed")}
          </p>
          <Link href="/login">{t("retry")}</Link>
        </>
      ) : (
        <p role="status">{t("working")}</p>
      )}
    </AuthCard>
  );
}
