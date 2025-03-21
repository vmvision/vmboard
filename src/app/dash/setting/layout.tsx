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
    // Get the last two parts of the path
    const parts = pathname.split("/");
    const lastPart = capitalize(parts[parts.length - 1] ?? "");
    
    const secondLastPart = capitalize(parts[parts.length - 2] ?? "");
    if (secondLastPart === "Setting") {
      return {
        title: t(`${lastPart}.title`),
        description: t(`${lastPart}.description`),
      };
    }
    return {
      title: t(`${secondLastPart}.${lastPart}.title`),
      description: t(`${secondLastPart}.${lastPart}.description`),
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
