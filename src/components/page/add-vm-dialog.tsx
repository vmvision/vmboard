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

const addVmToPageSchema = z.object({
  vmId: z.string().min(1, "Please select a VM"),
  nickname: z.string().optional(),
  pageId: z.number(),
});

type FormValues = z.infer<typeof addVmToPageSchema>;

export function AddVmDialog({
  children,
  pageId,
}: {
  children?: React.ReactNode;
  pageId: number;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  
  const { data: vms, isLoading } = useSWR(
    "/api/vm",
    fetchWrapper(apiClient.vm.$get)
  );

  const { trigger, isMutating } = useSWRMutation(
    "/api/page/vm",
    mutationWrapper(apiClient.page.vm.$post)
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(addVmToPageSchema),
    defaultValues: {
      vmId: "",
      nickname: "",
      pageId,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await trigger({
        json: values,
      });

      toast.success("VM added to page successfully");
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add VM to page"
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add VM to Page</DialogTitle>
          <DialogDescription>
            Select a virtual machine to add to this page.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vmId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Virtual Machine</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a VM" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vms?.map((vm) => (
                        <SelectItem key={vm.id} value={vm.id.toString()}>
                          {vm.nickname || vm.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose a VM to add to this page.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Custom name for this VM on this page"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    You can give this VM a custom display name for this page.
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
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isMutating || isLoading}
                isLoading={isMutating}
              >
                Add VM
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
