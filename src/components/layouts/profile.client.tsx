"use client";

import { authClient } from "@/lib/auth-client";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import type { Session } from "better-auth";
import { useCallback } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { LogOutIcon } from "lucide-react";

export const ProfileLogout: React.FC<{ session: Session }> = ({ session }) => {
  const t = useTranslations("Public.Auth");
  const router = useTransitionRouter();
  const logout = useCallback(async () => {
    await authClient.revokeSession(
      {
        token: session.token,
      },
      {
        onSuccess: () => {
          router.refresh();
          toast.success(t("logoutSuccess"));
        },
        onError: () => {
          toast.error(t("logoutFailed"));
        },
      },
    );
  }, [t, router, session]);

  return (
    <DropdownMenuItem onClick={logout}>
      <LogOutIcon />
      {t("logout")}
    </DropdownMenuItem>
  );
};
