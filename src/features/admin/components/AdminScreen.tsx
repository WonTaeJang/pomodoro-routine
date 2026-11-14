"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "use-intl";
import { CenteredCard } from "@/components/layout/CenteredCard";
import { PageMain } from "@/components/layout/PageMain";
import { Button, Card, Switch, TextField } from "@/components/ui";
import { useAuth, useProviderName } from "@/features/auth";
import { formatDate } from "@/lib/date";
import {
  fetchAdminData,
  setVip,
  type AdminStats,
  type AdminUser,
} from "../api";
import { useAccountFlags } from "../useAccountFlags";
import styles from "./AdminScreen.module.scss";

type AdminData = { users: AdminUser[]; stats: AdminStats };

/**
 * 관리자 페이지 (/admin): 간단한 통계와 회원 목록, 회원마다 VIP 켜기/끄기.
 * 관리자가 아니면 안내만 보임. (실제 권한 확인은 서버 함수가 함)
 */
export function AdminScreen() {
  const t = useTranslations("admin");
  const { status } = useAuth();
  const flags = useAccountFlags();

  if (status === "loading" || (status === "signedIn" && flags === null)) {
    return (
      <CenteredCard className={styles.notice}>
        <p role="status" className={styles.muted}>
          {t("loading")}
        </p>
      </CenteredCard>
    );
  }
  if (!flags?.admin) {
    return (
      <CenteredCard className={styles.notice}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.muted}>{t("notAllowed")}</p>
      </CenteredCard>
    );
  }
  return <AdminDashboard />;
}

function AdminDashboard() {
  const t = useTranslations("admin");
  const [data, setData] = useState<AdminData | null>(null);
  const [state, setState] = useState<"loading" | "failed" | "ready">("loading");

  function show(result: AdminData | null) {
    setData(result);
    setState(result ? "ready" : "failed");
  }

  // 처음 열 때 한 번 불러옴
  useEffect(() => {
    let alive = true;
    void fetchAdminData().then((result) => {
      if (alive) show(result);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <PageMain>
      <div className={styles.page}>
        <h1 className={styles.title}>{t("title")}</h1>
        {state === "loading" ? (
          <p role="status" className={styles.muted}>
            {t("loading")}
          </p>
        ) : state === "failed" || !data ? (
          <Card className={styles.section}>
            <p role="alert" className={styles.error}>
              {t("failed")}
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setState("loading");
                void fetchAdminData().then(show);
              }}
            >
              {t("retry")}
            </Button>
          </Card>
        ) : (
          <>
            <StatsCard stats={data.stats} />
            <UsersCard
              users={data.users}
              onChange={(users) =>
                setData({
                  users,
                  stats: {
                    ...data.stats,
                    vipUsers: users.filter((u) => u.vip).length,
                  },
                })
              }
            />
          </>
        )}
      </div>
    </PageMain>
  );
}

function StatsCard({ stats }: { stats: AdminStats }) {
  const t = useTranslations("admin.stats");
  const items: [string, number][] = [
    [t("total"), stats.totalUsers],
    [t("vip"), stats.vipUsers],
    [t("newUsers"), stats.newUsers7d],
    [t("activeUsers"), stats.activeUsers7d],
    [t("focusSessions"), stats.focusSessions7d],
  ];
  return (
    <Card as="section" className={styles.section}>
      <h2 className={styles.heading}>{t("title")}</h2>
      <dl className={styles.stats}>
        {items.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value.toLocaleString()}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

type UsersCardProps = {
  users: AdminUser[];
  /** VIP를 바꾼 뒤의 목록 */
  onChange: (users: AdminUser[]) => void;
};

function UsersCard({ users, onChange }: UsersCardProps) {
  const t = useTranslations("admin.users");
  const providerName = useProviderName();
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.nickname.toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q),
    );
  }, [users, query]);

  async function toggle(user: AdminUser, on: boolean) {
    setSaving(user.id);
    setFailed(false);
    const ok = await setVip(user.id, on);
    setSaving(null);
    if (ok) {
      onChange(users.map((u) => (u.id === user.id ? { ...u, vip: on } : u)));
    } else {
      setFailed(true);
    }
  }

  return (
    <Card as="section" className={styles.section}>
      <h2 className={styles.heading}>{t("title", { count: users.length })}</h2>
      <TextField
        label={t("search")}
        hideLabel
        placeholder={t("search")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        type="search"
      />
      {failed ? (
        <p role="alert" className={styles.error}>
          {t("saveFailed")}
        </p>
      ) : null}
      {shown.length === 0 ? (
        <p className={styles.muted}>{t("empty")}</p>
      ) : (
        <ul className={styles.users}>
          {shown.map((user) => {
            const name = user.nickname || t("noName");
            const details = [
              user.email,
              providerName(user.provider),
              t("joined", { date: formatDate(user.createdAt, locale) }),
              user.lastSignInAt
                ? t("lastSignIn", {
                    date: formatDate(user.lastSignInAt, locale),
                  })
                : null,
              t("focus", { count: user.focusCount }),
            ].filter(Boolean);
            return (
              <li key={user.id}>
                <Switch
                  label={name}
                  description={details.join(" · ")}
                  checked={user.vip}
                  disabled={saving === user.id}
                  aria-label={t("vipLabel", { name })}
                  onCheckedChange={(on) => void toggle(user, on)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
