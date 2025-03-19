"use client";

import { useForm } from "react-hook-form";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTransitionRouter } from "next-view-transitions";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useRef, useState } from "react";
import { env } from "@/env";
import { useLocale, useTranslations } from "next-intl";

interface IAuth {
  email: string;
  password: string;
}

export default function AuthPage() {
  const t = useTranslations("Public.Auth");
  const locale = useLocale();
  const cfTurnstilRef = useRef<TurnstileInstance | null>(null);

  const router = useTransitionRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<IAuth>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: IAuth) => {
    const turnstileToken = env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY
      ? cfTurnstilRef.current?.getResponse()
      : undefined;
    isSignUp
      ? await authClient.signUp.email({
          email: values.email,
          password: values.password,
          name: values.email,
          fetchOptions: {
            headers: {
              "x-captcha-response": turnstileToken as string,
            },
            onRequest: () => {
              setIsLoading(true);
            },
            onResponse: () => {
              setIsLoading(false);
            },
            onSuccess: () => {
              toast.success("注册成功");
              router.push("/dash");
            },
            onError: (ctx) => {
              toast.error("注册失败");
              console.error(ctx);
            },
          },
        })
      : await authClient.signIn.email({
          email: values.email,
          password: values.password,
          fetchOptions: {
            headers: {
              "x-captcha-response": turnstileToken as string,
            },
            onRequest: () => {
              setIsLoading(true);
            },
            onResponse: () => {
              setIsLoading(false);
            },
            onSuccess: () => {
              toast.success("登陆成功");
              router.push("/dash");
            },
            onError: (ctx) => {
              toast.error("登陆失败");
              console.error(ctx);
            },
          },
        });
  };

  const onOAuthSubmit = async (provider: "github") => {
    const res = await authClient.signIn.social({ provider });
    if (!res) return toast.error("OAuth 登录异常");
    const { error } = res;
    if (error) {
      toast.error(error.message);
    }
  };

  const handlePasskeySignIn = async () => {
    const res = await authClient.signIn.passkey();
    if (!res) return toast.error("Passkey 登录异常");
    const { error } = res;
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("登录成功");
      router.push("/dash");
    }
  };

  return (
    <Card className="mx-auto w-[384px]">
      <CardHeader>
        <CardTitle className="text-2xl">{isSignUp ? "注册" : "登录"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel>密码</FormLabel>
                  </div>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY && (
              <div className="mx-auto w-full">
                <Turnstile
                  ref={cfTurnstilRef}
                  options={{
                    language: locale,
                    size: "flexible",
                  }}
                  siteKey={env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY}
                />
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              data-umami-event={isSignUp ? "signup" : "signin"}
            >
              {isSignUp ? "注册" : "登录"}
            </Button>
          </form>
        </Form>
        <Separator className="my-4" />
        <div className="mt-4">
          <Button
            onClick={handlePasskeySignIn}
            variant="outline"
            className="w-full"
            data-umami-event="passkey-signin"
          >
            {t("passkey")}
          </Button>
          {env.NEXT_PUBLIC_ALLOW_OAUTH.includes("github") && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOAuthSubmit("github")}
            >
              {t("oauth", { provider: "GitHub" })}
            </Button>
          )}
        </div>
        <div className="mt-4 flex items-center justify-center gap-1 text-center text-sm">
          {isSignUp ? "已有账号？" : "没有账号？"}
          <Button
            variant="link"
            className="h-auto p-0 underline underline-offset-4"
            onClick={() => setIsSignUp((prev) => !prev)}
          >
            {isSignUp ? "登录" : "注册"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
