"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import type { User } from "better-auth";
import { authClient } from "@/lib/auth-client";

type FormUser = Pick<User, "email" | "name">;

export default function SettingAccountPage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending || !session) {
    return <div>Loading...</div>;
  }

  return <AccountForm user={session.user} />;
}
const AccountForm: React.FC<{ user: User }> = ({ user }) => {
  const t = useTranslations("Private.Setting.Personal.Account");
  const tAction = useTranslations("Private.Action");
  const form = useForm<FormUser>({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  const onSubmit = async (data: FormUser) => {
    await authClient.updateUser({
      name: data.name,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          rules={{ required: "昵称不能为空" }}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-red-500 text-sm">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          isLoading={form.formState.isSubmitting}
        >
          {tAction("save")}
        </Button>
      </form>
    </Form>
  );
};
