/*
 * This file is based on code from the nezha-dash project,
 * originally licensed under the Apache License 2.0.
 * The original license can be found in the LICENSE-APACHE file.
 *
 * Modifications made by AprilNEA <github@sku.moe>
 * Derived from: https://raw.githubusercontent.com/hamster1963/nezha-dash/ac15be6e71ba9804681b1fe760fa245f94912372/components/ServerUsageBar.tsx
 * Licensed under the GNU General Public License v3.0 (GPLv3).
 */
import { Progress } from "@/components/ui/progress";

type ServerUsageBarProps = {
  value: number | string;
};

export default function ServerUsageBar({ value }: ServerUsageBarProps) {
  const valueNumber = Number(value);
  return (
    <Progress
      aria-label={"Server Usage Bar"}
      aria-labelledby={"Server Usage Bar"}
      value={valueNumber}
      indicatorClassName={
        valueNumber > 90
          ? "bg-red-500"
          : valueNumber > 70
            ? "bg-orange-400"
            : "bg-green-500"
      }
      className={"h-[3px] rounded-sm"}
    />
  );
}
