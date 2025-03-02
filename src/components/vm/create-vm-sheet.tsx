"use client";

import useSWR from "swr";
import { type VM, vm as vmTable } from "@/db/schema/vm";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronsUpDown, FileJson2Icon, Loader } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import { updateVM } from "../../app/_lib/actions";
import {
  createVMSchema,
  type CreateVMSchema,
} from "../../app/_lib/validations";
import apiClient, { fetchWrapper } from "@/lib/api-client";
import { Separator } from "../ui/separator";
import { useEffect, useMemo } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Input } from "../ui/input";

interface CreateVMSheetProps extends React.ComponentPropsWithRef<typeof Sheet> {
  children: React.ReactNode;
}

export function CreateVMSheet({ children, ...props }: CreateVMSheetProps) {
  const merchantList = useSWR(
    "/api/merchant/list",
    fetchWrapper(apiClient.merchant.list.$get),
  );

  const [isCreatePending, startCreateTransition] = React.useTransition();

  const form = useForm<CreateVMSchema>({
    resolver: zodResolver(createVMSchema),
    defaultValues: {
      nickname: "",
      status: "running",
    },
  });
  const merchantId = form.watch("merchantId");
  const vmList = useSWR(
    merchantId
      ? ["/api/merchant/:id/list-vms", { param: { id: merchantId } }]
      : null,
    fetchWrapper(apiClient.merchant[":id"]["list-vms"].$get),
  );
  const [vmId, setVmId] = React.useState<string>("");
  const vm = useMemo(() => {
    if (vmList.data) {
      return vmList.data.find((vm) => String(vm.id) === String(vmId));
    }
    return null;
  }, [vmList, vmId]);

  useEffect(() => {
    if (vm) {
      form.setValue("nickname", vm.hostname);
      // form.setValue("ipAddress", vm);
      form.setValue("metadata", vm);
    }
  }, [vm, form.setValue]);

  function onSubmit(input: CreateVMSchema) {
    startCreateTransition(async () => {
      if (!vm) return;

      const { error } = await updateVM({
        id: vm.id,
        ...input,
      });

      if (error) {
        toast.error(error);
        return;
      }

      form.reset();
      props.onOpenChange?.(false);
      toast.success("VM updated");
    });
  }

  return (
    <Sheet {...props}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>导入机器</SheetTitle>
          <SheetDescription>导入机器到系统中</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="merchantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VPS 账号</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="capitalize">
                        <SelectValue placeholder="Select a label" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {merchantList.isLoading ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : (
                          merchantList.data?.map((merchant) => (
                            <SelectItem
                              key={merchant.id}
                              value={merchant.id.toString()}
                            >
                              {merchant.nickname}
                            </SelectItem>
                          ))
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {vmList.data && (
              <Select value={vmId} onValueChange={setVmId}>
                <SelectTrigger className="capitalize">
                  <SelectValue placeholder="Select a label" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    {vmList.isLoading ? (
                      <SelectItem value="loading">Loading...</SelectItem>
                    ) : (
                      vmList.data?.map((vm) => (
                        <SelectItem key={vm.id} value={vm.id.toString()}>
                          {vm.hostname}
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            {vm && (
              <Collapsible className="w-full space-y-2">
                <div className="flex items-center justify-between space-x-4">
                  <h4 className="font-semibold text-sm">机器信息</h4>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FileJson2Icon className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                  地区: {vm.location}
                </div>
                <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                  总流量: {vm.trafficTotal}
                </div>
                <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                  已用流量: {vm.trafficUsed}
                </div>
                <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                  剩余流量: {vm.trafficTotal - vm.trafficUsed}
                </div>
                <CollapsibleContent className="space-y-2">
                  <pre>{JSON.stringify(vm, null, 2)}</pre>
                </CollapsibleContent>
              </Collapsible>
            )}
            <Separator />
            <h3>手动导入</h3>
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>昵称</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="node.example.com"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ipAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP 地址</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="192.168.0.1"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ipAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>注释</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="CN2 GIA"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="gap-2 pt-2 sm:space-x-0">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  取消
                </Button>
              </SheetClose>
              <Button disabled={isCreatePending}>
                {isCreatePending && (
                  <Loader
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                导入
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
