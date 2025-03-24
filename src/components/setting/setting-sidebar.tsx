"use client";


import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "next-view-transitions";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { capitalize } from "@/lib/utils";

import { siteItems, userItems } from "./items";


export function SettingSidebar() {
  const t = useTranslations("Private.Setting");
  const pathname = usePathname();

  return (
    <Sidebar collapsible="none" className="rounded-lg bg-transparent">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("Personal.title")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => {
                const path = `/dash/setting/personal/${item.id}`;
                return (
                  <SidebarMenuItem key={path}>
                    <SidebarMenuButton asChild isActive={pathname === path}>
                      <Link href={path}>
                        <item.icon />
                        <span>{t(`Personal.${capitalize(item.id)}.title`)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t("Site.title")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {siteItems.map((item) => {
                const path = `/dash/setting/site/${item.id}`;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={pathname === path}>
                      <Link href={path}>
                        <item.icon />
                        <span>{t(`Site.${capitalize(item.id)}.title`)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
