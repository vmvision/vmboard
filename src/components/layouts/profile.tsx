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
import Link from "next/link";

export default async function Profile() {
  // 获取 headers 并转换为 Headers 类型
  const readonlyHeaders = await headers();
  const mutableHeaders = new Headers();
  readonlyHeaders.forEach((value, key) => {
    mutableHeaders.set(key, value);
  });

  const session = await auth.api.getSession({
    headers: mutableHeaders,
  });
  if (!session) {
    return (
      <a href="/auth" className="text-foreground/60 hover:text-foreground">
        Log In
      </a>
    );
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
        <DropdownMenuItem asChild>
          <Link href="/dash/setting/account" className="block w-full">
            我的账户
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dash/setting" className="block w-full">
            设置
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ProfileLogout session={session.session} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}