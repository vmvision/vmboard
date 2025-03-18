"use client";

import { SettingSidebar } from "@/components/setting/setting-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { capitalize } from "@/lib/utils";

export default function SettingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Private.Setting");
  const pathname = usePathname();
  const { title, description } = useMemo(() => {
    if (!pathname.startsWith("/dash/setting")) {
      return {
        title: "Unknown",
        description: "Unknown",
      };
    }
    const part = capitalize(pathname.split("/").pop() ?? "");
    return {
      title: t(`Personal.${part}.title`),
      description: t(`Personal.${part}.description`),
    };
  }, [t, pathname]);

  return (
    <div className="container mx-auto mt-16">
      <SidebarProvider className="min-h-0">
        <Card>
          <SettingSidebar />
        </Card>
        <Card className="ml-4 w-full">
          <CardHeader>
            <CardTitle className="font-bold text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
            <Separator className="w-full" />
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </SidebarProvider>
    </div>
  );
}
