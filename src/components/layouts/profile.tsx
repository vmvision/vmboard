import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ProfileLogout } from "./profile.client";
import { Link } from "next-view-transitions";
import { Button } from "../ui/button";
import { getTranslations } from "next-intl/server";
import { BoltIcon, CircleUserRoundIcon } from "lucide-react";
export default async function Profile() {
  const t = await getTranslations("Public.Auth");
  const tP = await getTranslations("Private.Profile");

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return (
      <Link href="/auth" className="text-foreground/60 hover:text-foreground">
        <Button className="ml-2" size="sm">
          {t("login")}
        </Button>
      </Link>
    );
  }
  const { user } = session;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="ml-2 size-8 cursor-pointer">
          {user.image && <AvatarImage src={user?.image} alt={user?.name} />}
          <AvatarFallback>{user?.email.slice(0, 2)}</AvatarFallback>
          <span className="sr-only">{tP("menu")}</span>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href="/dash/setting/personal/account" className="block w-full">
            <CircleUserRoundIcon />
            {tP("account")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dash/setting" className="block w-full">
            <BoltIcon />
            {tP("setting")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ProfileLogout session={session.session} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
