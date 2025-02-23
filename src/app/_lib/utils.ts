import { Merchant, type Task, tasks } from "@/db/schema";
import { faker } from "@faker-js/faker";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircle2,
  CircleHelp,
  CircleIcon,
  CircleX,
  Timer,
} from "lucide-react";
import { customAlphabet } from "nanoid";

import { generateId } from "@/lib/id";
import { DMITLogoWithText2022, HKG, LAX, TYO } from "@/components/icons/dmit";

export function generateRandomTask(): Task {
  return {
    id: generateId("task"),
    code: `TASK-${customAlphabet("0123456789", 4)()}`,
    title: faker.hacker
      .phrase()
      .replace(/^./, (letter) => letter.toUpperCase()),
    status: faker.helpers.shuffle(tasks.status.enumValues)[0] ?? "todo",
    label: faker.helpers.shuffle(tasks.label.enumValues)[0] ?? "bug",
    priority: faker.helpers.shuffle(tasks.priority.enumValues)[0] ?? "low",
    archived: faker.datatype.boolean({ probability: 0.2 }),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Returns the appropriate status icon based on the provided status.
 * @param status - The status of the task.
 * @returns A React component representing the status icon.
 */
export function getStatusIcon(status: Task["status"]) {
  const statusIcons = {
    canceled: CircleX,
    running: CheckCircle2,
    expired: Timer,
    stopped: CircleHelp,
    error: CircleX,
  };

  return statusIcons[status] || CircleIcon;
}

export function getMerchantIcon(merchant: Merchant["merchant"]) {
  const merchantIcons = {
    dmit: DMITLogoWithText2022,
  };

  return merchantIcons[merchant] || CircleIcon;
}
export function getDMITLocationIcon(location: "HKG" | "LAX" | "TYO") {
  const dmitLocationIcons = {
    HKG: HKG,
    LAX: LAX,
    TYO: TYO,
  };

  return dmitLocationIcons[location] || CircleIcon;
}
/**
 * Returns the appropriate priority icon based on the provided priority.
 * @param priority - The priority of the task.
 * @returns A React component representing the priority icon.
 */
export function getPriorityIcon(priority: Task["priority"]) {
  const priorityIcons = {
    high: ArrowUpIcon,
    low: ArrowDownIcon,
    medium: ArrowRightIcon,
  };

  return priorityIcons[priority] || CircleIcon;
}
