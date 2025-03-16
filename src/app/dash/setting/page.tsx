import { Shell } from "@/components/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function SettingPage() {
  const t = useTranslations("settings");

  return (
    <Shell>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("settings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li>
              <Link href="/dash/setting/account" className="text-blue-600 hover:underline">
                {t("account")}
              </Link>
            </li>
            {/* 未来可以添加其他设置页面链接 */}
          </ul>
        </CardContent>
      </Card>
    </Shell>
  );
}