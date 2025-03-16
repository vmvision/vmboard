"use client"; // 客户端组件

import { Shell } from "@/components/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getUser, getLatestSession } from "@/app/_lib/queries";

interface User {
  name: string;
  email: string;
  username: string | null;
  createdAt: string; // 不可为 null
  role: string | null;
  emailVerified: boolean;
  banned: boolean | null;
  banReason: string | null;
  banExpires: string | null;
  image: string | null;
}

interface Session {
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string; // 不可为 null
}

interface UpdateUserResponse {
  success: boolean;
  error?: string;
}

export default function AccountPage({
  user: initialUser,
  latestSession: initialSession,
}: {
  user: User;
  latestSession: Session | null;
}) {
  const t = useTranslations("account");
  const [user, setUser] = useState(initialUser);
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, username }),
      });

      const data = (await response.json()) as UpdateUserResponse;

      if (data.success) {
        setUser({ ...user, name, username });
        window.alert(t("update_success"));
      } else {
        throw new Error(data.error || "Failed to update");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      window.alert(t("update_failed") + ": " + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("account_details")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                {t("name")}
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium">
                {t("username")}
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("submitting") : t("save")}
            </Button>
          </form>
          <div className="space-y-2">
            <p>{t("email")}: {user.email}</p>
            <p>{t("created_at")}: {new Date(user.createdAt).toLocaleDateString()}</p>
            <p>{t("role")}: {user.role || "user"}</p>
            <p>{t("email_verified")}: {user.emailVerified ? "Yes" : "No"}</p>
            {user.banned && (
              <p>
                {t("banned")}: {user.banReason || "No reason"}
                {user.banExpires && ` (until ${new Date(user.banExpires).toLocaleString()})`}
              </p>
            )}
            {user.image && (
              <p>
                {t("avatar")}: <img src={user.image} alt="Avatar" width="50" />
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{t("recent_activity")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            {t("last_login")}:{" "}
            {initialSession?.createdAt
              ? new Date(initialSession.createdAt).toLocaleString()
              : "Never"}
          </p>
          <p>{t("ip_address")}: {initialSession?.ipAddress || "Unknown"}</p>
          <p>{t("device")}: {initialSession?.userAgent || "Unknown"}</p>
        </CardContent>
      </Card>
    </Shell>
  );
}

export async function getServerSideProps() {
  const session = await auth.api.getSession({ headers: {} as Headers });
  if (!session) {
    return { redirect: { destination: "/auth", permanent: false } };
  }

  const user = await getUser(session.user.id);
  if (!user) {
    return { redirect: { destination: "/auth", permanent: false } };
  }

  const latestSession = await getLatestSession(session.user.id);

  return {
    props: {
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        banExpires: user.banExpires?.toISOString() || null,
      },
      latestSession: latestSession
        ? {
            ...latestSession,
            createdAt: latestSession.createdAt.toISOString(),
          }
        : null,
    },
  };
}