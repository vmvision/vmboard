"use client";

import { setupVMSSHInfo } from "@/app/_lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { SSHInfo, SSHKey, VM } from "@/db/schema";
import { useForm } from "react-hook-form";

export default function TerminalSetupPage({
  vm,
  sshKeys,
}: {
  vm: VM;
  sshKeys: SSHKey[];
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SSHInfo>({
    defaultValues: {
      host: undefined,
      port: undefined,
      username: undefined,
      password: undefined,
      privateKey: undefined,
    },
  });

  const onSubmit = (data: SSHInfo) => {
    setupVMSSHInfo({
      id: vm.id,
      sshInfo: data,
    });
  };
  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="font-bold text-2xl">Setup SSH Info</h1>

      <Separator className="my-4" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="host">主机地址</Label>
            <Input
              id="host"
              {...register("host")}
              placeholder={vm.ipAddress ?? undefined}
            />
            {errors.host && (
              <p className="text-destructive text-sm">{errors.host.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              type="number"
              {...register("port")}
              placeholder="22"
            />
            {errors.port && (
              <p className="text-destructive text-sm">{errors.port.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...register("username")} placeholder="root" />
            {errors.username && (
              <p className="text-destructive text-sm">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="text-destructive text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="privateKey">私钥</Label>
            <Select>
              <SelectTrigger className="capitalize">
                <SelectValue placeholder="选择一个 SSH Key" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {sshKeys.map((sshKey) => (
                    <SelectItem key={sshKey.id} value={sshKey.id.toString()}>
                      {sshKey.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Textarea
              id="privateKey"
              {...register("privateKey")}
              placeholder="Enter private key"
              className="min-h-[100px]"
            />
            {errors.privateKey && (
              <p className="text-destructive text-sm">
                {errors.privateKey.message}
              </p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full">
          Connect
        </Button>
      </form>
    </div>
  );
}
