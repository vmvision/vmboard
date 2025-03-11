"use client";

import { type VM, vm as vmTable, type VMWithMerchant } from "@/db/schema/vm";
import type { DataTableRowAction } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Ellipsis, PenLineIcon, TerminalIcon, TrashIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/lib/handle-error";
import { cn, formatDate } from "@/lib/utils";

import { updateVM } from "../../app/_lib/actions";
import {
  getDMITLocationIcon,
  getMerchantIcon,
  getStatusIcon,
} from "../../app/_lib/utils";
import type { Merchant } from "@/db/schema";
import Link from "next/link";

interface GetColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<VMWithMerchant> | null>
  >;
}

export function getColumns({
  setRowAction,
}: GetColumnsProps): ColumnDef<VMWithMerchant>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      size: 40,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      size: 40,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "merchant",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="商户" />
      ),
      cell: ({ row }) => {
        const merchant: Merchant = row.getValue("merchant");
        if (!merchant) return null;
        const Icon = getMerchantIcon(merchant.merchant);
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4" aria-hidden="true" />
            {/* {merchant.nickname} */}
          </div>
        );
      },
    },
    {
      accessorKey: "nickname",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="昵称" />
      ),
      cell: ({ row }) => {
        // const label = tasks.label.enumValues.find(
        //   (label) => label === row.original.label,
        // );

        return (
          <div className="flex space-x-2">
            {/* {label && <Badge variant="outline">{label}</Badge>} */}
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("nickname")}
            </span>
          </div>
        );
      },
    },
    {
      id: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="地区" />
      ),
      cell: ({ row }) => {
        const metadata = row.original.metadata;
        if (!metadata) return null;
        if (row.original.merchant.merchant === "dmit") {
          const Icon = getDMITLocationIcon(
            metadata.location as "HKG" | "LAX" | "TYO",
          );
          return (
            <div className="flex items-center gap-2">
              <Icon className="h-5" aria-hidden="true" />
              {metadata.location}
            </div>
          );
        }
        return <div className="w-20">{metadata.location}</div>;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="状态" />
      ),
      cell: ({ row }) => {
        const status = vmTable.status.enumValues.find(
          (status) => status === row.original.status,
        );

        if (!status) return null;

        const Icon = getStatusIcon(status);

        return (
          <div className="flex w-[6.25rem] items-center">
            <Icon
              className={cn("mr-2 size-4 text-muted-foreground", {
                "text-red-500": status === "error",
                "text-green-600": status === "running",
                "text-yellow-500": status === "stopped",
                "text-blue-500": status === "expired",
              })}
              aria-hidden="true"
            />
            <span className="capitalize">{status}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "ipAddress",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="IP地址" />
      ),
      cell: ({ row }) => {
        console.log(row.original);
        return <div className="w-20">{row.getValue("ipAddress")}</div>;
      },
    },
    {
      id: "trafficUsed",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="流量使用" />
      ),
      cell: ({ row }) => {
        const metadata = row.original.metadata;
        if (!metadata) return null;
        return <div className="w-20">{metadata.trafficUsed}</div>;
      },
    },
    {
      id: "trafficLimit",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="流量限制" />
      ),
      cell: ({ row }) => {
        const metadata = row.original.metadata;
        if (!metadata) return null;
        return <div className="w-20">{metadata.trafficTotal}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="创建时间" />
      ),
      cell: ({ cell }) => formatDate(cell.getValue() as Date),
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        const [isUpdatePending, startUpdateTransition] = React.useTransition();

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
              >
                <Ellipsis className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <Link
                target="_blank"
                href={`/dash/terminal?vmId=${row.original.id}`}
              >
                <DropdownMenuItem>
                  <TerminalIcon className="size-4" aria-hidden="true" />
                  终端
                  <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, type: "update" })}
              >
                <PenLineIcon className="size-4" aria-hidden="true" />
                编辑
                <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
              </DropdownMenuItem>
              {/*<DropdownMenuSub>
                 <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={row.original.label}
                    onValueChange={(value) => {
                      startUpdateTransition(() => {
                        toast.promise(
                          updateTask({
                            id: row.original.id,
                            label: value as Task["label"],
                          }),
                          {
                            loading: "Updating...",
                            success: "Label updated",
                            error: (err) => getErrorMessage(err),
                          },
                        );
                      });
                    }}
                  >
                    {tasks.label.enumValues.map((label) => (
                      <DropdownMenuRadioItem
                        key={label}
                        value={label}
                        className="capitalize"
                        disabled={isUpdatePending}
                      >
                        {label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator /> */}
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, type: "delete" })}
              >
                <TrashIcon className="size-4" aria-hidden="true" />
                删除
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 40,
    },
  ];
}
