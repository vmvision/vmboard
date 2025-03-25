"use client";

import { cn } from "@/lib/utils";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const links = [
  {
    href: "/dash",
    label: "vm",
  },
  {
    href: "/dash/page",
    label: "page",
  },
  {
    href: "/dash/rule",
    label: "rule",
  },
];

export function LinkBar() {
  const t = useTranslations("Public.Link");
  const pathname = usePathname();
  return links.map((link) => (
    <Link
      key={link.label}
      href={link.href}
      className={cn(
        "text-foreground/60 transition-colors hover:text-foreground",
        pathname === link.href && "text-foreground",
      )}
    >
      {t(link.label)}
    </Link>
  ));
}
