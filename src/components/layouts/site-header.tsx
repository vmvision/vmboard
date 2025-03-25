import { Link } from "next-view-transitions";
import { Icons } from "@/components/icons";
import { ModeToggle } from "@/components/layouts/mode-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import Logo from "../icons/logo";
import Profile from "./profile";
import { LinkBar } from "./link-bar";
import { BookOpenTextIcon } from "lucide-react";

export async function SiteHeader() {
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
          <LinkBar />
        </nav>
        <nav className="flex flex-1 items-center gap-1 md:justify-end">
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <Link
              aria-label="GitHub repo"
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icons.GitHub className="size-5" aria-hidden="true" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <Link
              href={siteConfig.links.docs}
              target="_blank"
              rel="noopener noreferrer"
            >
              <BookOpenTextIcon
                className="size-5"
                aria-hidden="true"
                strokeWidth="1.5"
              />
            </Link>
          </Button>
          <ModeToggle />
          <Profile />
        </nav>
      </div>
    </header>
  );
}
