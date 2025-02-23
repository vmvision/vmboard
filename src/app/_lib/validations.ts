import { type VM, vm as vmTable } from "@/db/schema/vm";
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import * as z from "zod";

import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";

export const searchParamsCache = createSearchParamsCache({
  flags: parseAsArrayOf(z.enum(["advancedTable", "floatingBar"])).withDefault(
    [],
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<VM>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  title: parseAsString.withDefault(""),
  status: parseAsArrayOf(z.enum(vmTable.status.enumValues)).withDefault([]),
  // priority: parseAsArrayOf(z.enum(tasks.priority.enumValues)).withDefault([]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const createVMSchema = z.object({
  nickname: z.string(),
  // label: z.enum(tasks.label.enumValues),
  status: z.enum(vmTable.status.enumValues),
  merchantId: z.string(),
  // priority: z.enum(tasks.priority.enumValues),
});

export const updateVMSchema = z.object({
  nickname: z.string().optional(),
  // label: z.enum(tasks.label.enumValues).optional(),
  status: z.enum(vmTable.status.enumValues).optional(),
  // priority: z.enum(tasks.priority.enumValues).optional(),
});

export type GetVMSchema = Awaited<ReturnType<typeof searchParamsCache.parse>>;
export type CreateVMSchema = z.infer<typeof createVMSchema>;
export type UpdateVMSchema = z.infer<typeof updateVMSchema>;
