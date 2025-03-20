"use client";

import { authClient } from "@/lib/auth-client";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import type { Session } from "better-auth";
import { useCallback } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { toast } from "sonner";

export const ProfileLogout: React.FC<{ session: Session }> = ({ session }) => {
  const router = useTransitionRouter();
  const logout = useCallback(async () => {
    await authClient.revokeSession(
      {
        token: session.token,
      },
      {
        onSuccess: () => {
          router.refresh();
          toast.success("退出登录成功");
        },
        onError: () => {
          toast.error("退出登录失败");
        },
      },
    );
  }, [router, session]);

  return (
    <DropdownMenuItem onClick={logout}>
      退出登录
    </DropdownMenuItem>
  );
};
