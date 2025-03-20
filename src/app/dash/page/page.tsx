import { Shell } from "@/components/shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageManagementData } from "./page.client";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Private.Page.Management");
  
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function Page() {
  const t = await getTranslations("Private.Page.Management");

  return (
    <Shell>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="font-bold text-2xl tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("subTitle")}</CardTitle>
            <CardDescription>
              {t("description2")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PageManagementData />
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
