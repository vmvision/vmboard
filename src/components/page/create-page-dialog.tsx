"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useSWRMutation from "swr/mutation";

import { createPageSchema } from "@/db/schema/page";
import apiClient, { mutationWrapper } from "@/lib/api-client";
import { useTranslations } from "next-intl";

type FormValues = z.infer<typeof createPageSchema>;

export function CreatePageDialog({ children }: { children?: React.ReactNode }) {
  const t = useTranslations("Private.Page.Detail");
  const tAction = useTranslations("Private.Action");

  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const { trigger, error, isMutating } = useSWRMutation(
    "/api/page",
    mutationWrapper(apiClient.page.$post),
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(createPageSchema),
    defaultValues: {
      title: "",
      description: "",
      handle: null,
      hostname: null,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await trigger({
        json: values,
      });

      if (!error) {
        throw new Error(error || "Failed to create page");
      }

      toast.success("Page created successfully");
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create page",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("createPage")}</DialogTitle>
          <DialogDescription>
            {t("createPageDescription")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("title")}</FormLabel>
                  <FormControl>
                    <Input placeholder="My VM Page" {...field} />
                  </FormControl>
                  <FormDescription>{t("titleDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="handle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("handle")}</FormLabel>
                  <FormControl>
                    <Input placeholder="my-vm-page" {...field} />
                  </FormControl>
                  <FormDescription>{t("handleDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hostname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hostname")}</FormLabel>
                  <FormControl>
                    <Input placeholder="my-vm.example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    {t("hostnameDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your VM page..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t("descriptionDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                type="button"
                disabled={isMutating}
                onClick={() => setOpen(false)}
              >
                {tAction("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isMutating}
                isLoading={isMutating}
              >
                {tAction("create")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
