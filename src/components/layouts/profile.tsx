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

export default async function Profile() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return null;
  }
  const { user } = session;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="ml-2 size-8 cursor-pointer">
          {user.image && <AvatarImage src={user?.image} alt={user?.name} />}
          <AvatarFallback>{user?.email.slice(0, 2)}</AvatarFallback>
          <span className="sr-only">菜单</span>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>我的账户</DropdownMenuItem>
        <DropdownMenuItem>设置</DropdownMenuItem>
        <DropdownMenuSeparator />
        <ProfileLogout session={session.session} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
