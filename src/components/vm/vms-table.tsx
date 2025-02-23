"use client";

import { type VM, vm as vmTable } from "@/db/schema/vm";
import type {
  DataTableAdvancedFilterField,
  DataTableFilterField,
  DataTableRowAction,
} from "@/types";
import * as React from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { toSentenceCase } from "@/lib/utils";

import type { getMerchants, getVMs, getVMStatusCounts } from "../../app/_lib/queries";
import { getPriorityIcon, getStatusIcon } from "../../app/_lib/utils";
import { DeleteVMsDialog } from "./delete-vms-dialog";
import { useFeatureFlags } from "./feature-flags-provider";
import { getColumns } from "./vms-table-columns";
import { VMsTableFloatingBar } from "./vms-table-floating-bar";
import { VMsTableToolbarActions } from "./vms-table-toolbar-actions";
import { UpdateVMSheet } from "./update-vm-sheet";

interface TasksTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getVMs>>,
      Awaited<ReturnType<typeof getMerchants>>,
      Awaited<ReturnType<typeof getVMStatusCounts>>,
    ]
  >;
}

export function VMsTable({ promises }: TasksTableProps) {
  const { featureFlags } = useFeatureFlags();

  const [{ data, pageCount }, merchants, statusCounts] = React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<VM> | null>(null);

  const columns = React.useMemo(() => getColumns({ setRowAction }), []);

  /**
   * This component can render either a faceted filter or a search filter based on the `options` prop.
   *
   * @prop options - An array of objects, each representing a filter option. If provided, a faceted filter is rendered. If not, a search filter is rendered.
   *
   * Each `option` object has the following properties:
   * @prop {string} label - The label for the filter option.
   * @prop {string} value - The value for the filter option.
   * @prop {React.ReactNode} [icon] - An optional icon to display next to the label.
   * @prop {boolean} [withCount] - An optional boolean to display the count of the filter option.
   */
  const filterFields: DataTableFilterField<VM>[] = [
    {
      id: "nickname",
      label: "昵称",
      placeholder: "Filter titles...",
    },
    {
      id: "status",
      label: "状态",
      options: vmTable.status.enumValues.map((status) => ({
        label: toSentenceCase(status),
        value: status,
        icon: getStatusIcon(status),
        count: statusCounts[status],
      })),
    },
  ];

  /**
   * Advanced filter fields for the data table.
   * These fields provide more complex filtering options compared to the regular filterFields.
   *
   * Key differences from regular filterFields:
   * 1. More field types: Includes 'text', 'multi-select', 'date', and 'boolean'.
   * 2. Enhanced flexibility: Allows for more precise and varied filtering options.
   * 3. Used with DataTableAdvancedToolbar: Enables a more sophisticated filtering UI.
   * 4. Date and boolean types: Adds support for filtering by date ranges and boolean values.
   */
  const advancedFilterFields: DataTableAdvancedFilterField<VM>[] = [
    {
      id: "nickname",
      label: "昵称",
      type: "text",
    },
    {
      id: "status",
      label: "Status",
      type: "multi-select",
      options: vmTable.status.enumValues.map((status) => ({
        label: toSentenceCase(status),
        value: status,
        icon: getStatusIcon(status),
        count: statusCounts[status],
      })),
    },
    {
      id: "createdAt",
      label: "Created at",
      type: "date",
    },
  ];

  const enableAdvancedTable = featureFlags.includes("advancedTable");
  const enableFloatingBar = featureFlags.includes("floatingBar");

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: enableAdvancedTable,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow) => String(originalRow.id),
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <>
      <DataTable
        table={table}
        floatingBar={
          enableFloatingBar ? <VMsTableFloatingBar table={table} /> : null
        }
      >
        {enableAdvancedTable ? (
          <DataTableAdvancedToolbar
            table={table}
            filterFields={advancedFilterFields}
            shallow={false}
          >
            <VMsTableToolbarActions table={table} />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table} filterFields={filterFields}>
            <VMsTableToolbarActions table={table} />
          </DataTableToolbar>
        )}
      </DataTable>
      <UpdateVMSheet
        open={rowAction?.type === "update"}
        onOpenChange={() => setRowAction(null)}
        vm={rowAction?.row.original ?? null}
      />
      <DeleteVMsDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        vms={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  );
}
