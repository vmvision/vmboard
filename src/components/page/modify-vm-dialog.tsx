"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import apiClient, { fetchWrapper, mutationWrapper } from "@/lib/api-client";
import { useTranslations } from "next-intl";

const modifyVmToPageSchema = z.object({
  nickname: z.string(),
});

type FormValues = z.infer<typeof modifyVmToPageSchema>;

export function ModifyVmDetailInPageDialog({
  children,
  vmId,
}: {
  children?: React.ReactNode;
  vmId: number;
}) {
  const t = useTranslations("Private.Page.Detail");
  const tAction = useTranslations("Private.Action");

  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const { trigger, isMutating } = useSWRMutation(
    `/api/vm/${vmId}`,
    mutationWrapper(apiClient.vm[":id"].$put),
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(modifyVmToPageSchema),
    defaultValues: {
      nickname: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await trigger({
        json: {
          nickname: values.nickname || "",
        },
        param: {
          id: vmId.toString(),
        },
      });

      toast.success("VM nickname updated successfully");
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update VM nickname",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("updateVmInPage")}</DialogTitle>
          <DialogDescription>
            {t("updateVmInPageDescription")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("updateVmDisplayName")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("updateVmDisplayNameDescription")}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("updateVmDisplayNameDescription")}
                  </FormDescription>
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
                {t("updateVmNickname")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
