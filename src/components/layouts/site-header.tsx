import Link from "next/link";

import { Icons } from "@/components/icons";
import { ModeToggle } from "@/components/layouts/mode-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import Logo from "../icons/logo";
import Profile from "./profile";
import { getTranslations } from "next-intl/server";

export async function SiteHeader() {
  const t = await getTranslations("Public.Link");

  return (
    <header className="sticky top-0 z-50 w-full border-border/40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-2 flex items-center md:mr-6 md:space-x-2">
          <Logo className="size-5" aria-hidden="true" />
          <span className="hidden font-bold md:inline-block">
            {siteConfig.name}
          </span>
        </Link>
        <nav className="flex w-full items-center gap-6 text-sm">
          <Link
            href="https://vmboard.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/60 transition-colors hover:text-foreground"
          >
            {t("docs")}
          </Link>
          <Link
            href="/dash/page"
            // target="_blank"
            // rel="noopener noreferrer"
            className="text-foreground/60 transition-colors hover:text-foreground"
          >
            {t("page")}
          </Link>
        </nav>
        <nav className="flex flex-1 items-center md:justify-end">
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <Link
              aria-label="GitHub repo"
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icons.gitHub className="size-5" aria-hidden="true" />
            </Link>
          </Button>
          <ModeToggle />
          <Profile />
        </nav>
      </div>
    </header>
  );
}
