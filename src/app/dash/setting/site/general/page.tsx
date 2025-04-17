"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { z } from "zod";

export const SiteSettingSchema = z.object({
  basic: z.object({
    name: z.string(),
    description: z.string(),
  }),
  preferences: z.object({
    theme: z.string(),
    color: z.string(),
    font: z.string(),
    fontSize: z.string(),
  }),
  monitor: z.object({
    ip_info: z.boolean(),
    flag: z.boolean(),
    network_transfer: z.boolean(),
    svg_flag: z.boolean(),
    top_server_name: z.boolean(),
  }),
});

type SiteSetting = z.infer<typeof SiteSettingSchema>;

export default function SiteSettingPage() {
  const t = useTranslations("Private.Setting.Site.General.Detail");
  const form = useForm<SiteSetting>();
  const onSubmit = async (data: SiteSetting) => {
    console.log(data);
  };

  return ( 
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="basic.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="basic.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("description")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
