import { Shell } from "@/components/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getUser, getLatestSession } from "@/app/_lib/queries";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

interface User {
  name: string;
  email: string;
  username: string | null;
  createdAt: string;
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
  createdAt: string;
}

export default async function AccountPage() {
  const t = await getTranslations("account");

  try {
    // 获取 headers 并转换为 Headers 类型
    const readonlyHeaders = await headers();
    const mutableHeaders = new Headers();
    readonlyHeaders.forEach((value, key) => {
      mutableHeaders.set(key, value);
    });

    // 获取会话
    const session = await auth.api.getSession({ headers: mutableHeaders });
    if (!session) {
      redirect("/auth");
    }

    // 获取用户数据
    const user = await getUser(session.user.id);
    if (!user) {
      redirect("/auth");
    }

    // 获取最近会话
    const latestSession = await getLatestSession(session.user.id);

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
            <form action="/api/update-user" method="POST" className="space-y-4">
              <input type="hidden" name="userId" value={user.id} />
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  {t("name")}
                </label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={user.name}
                  required
                />
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-medium">
                  {t("username")}
                </label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={user.username || ""}
                  placeholder="Optional"
                />
              </div>
              <Button type="submit">{t("save")}</Button>
            </form>
            <div className="space-y-2">
              <p>{t("email")}: {user.email}</p>
              <p>
                {t("created_at")}:{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <p>{t("role")}: {user.role || "user"}</p>
              <p>{t("email_verified")}: {user.emailVerified ? "Yes" : "No"}</p>
              {user.banned && (
                <p>
                  {t("banned")}: {user.banReason || "No reason"}
                  {user.banExpires &&
                    ` (until ${new Date(user.banExpires).toLocaleString()})`}
                </p>
              )}
              {user.image && (
                <p>
                  {t("avatar")}:{" "}
                  <img src={user.image} alt="Avatar" width="50" />
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
              {latestSession?.createdAt
                ? new Date(latestSession.createdAt).toLocaleString()
                : "Never"}
            </p>
            <p>{t("ip_address")}: {latestSession?.ipAddress || "Unknown"}</p>
            <p>{t("device")}: {latestSession?.userAgent || "Unknown"}</p>
          </CardContent>
        </Card>
      </Shell>
    );
  } catch (error) {
    console.error("Error in AccountPage:", error);
    return (
      <Shell>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Error</h2>
          <p className="text-muted-foreground">
            Failed to load account page. Please try again later.
          </p>
        </div>
      </Shell>
    );
  }
}