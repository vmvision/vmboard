"use client";

import type { VM } from "@/db/schema/vm";
import type { Table } from "@tanstack/react-table";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
// import { exportTableToCSV } from "@/lib/export";

import { DeleteVMsDialog } from "./delete-vms-dialog";
import { CreateVMSheet } from "./create-vm-sheet";

interface VMsTableToolbarActionsProps {
  table: Table<VM>;
}

export function VMsTableToolbarActions({ table }: VMsTableToolbarActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteVMsDialog
          vms={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          onSuccess={() => table.toggleAllRowsSelected(false)}
        />
      ) : null}
      {/* <Button
        variant="outline"
        size="sm"
        onClick={() =>
          exportTableToCSV(table, {
            filename: "tasks",
            excludeColumns: ["select", "actions"],
          })
        }
        className="gap-2"
      >
        <Download className="size-4" aria-hidden="true" />
        导出
      </Button> */}
      {/**
       * Other actions can be added here.
       * For example, import, view, etc.
       */}
      <CreateVMSheet>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="size-4" aria-hidden="true" />
          导入
        </Button>
      </CreateVMSheet>
    </div>
  );
}
