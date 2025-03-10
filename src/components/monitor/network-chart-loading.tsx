/*
 * This file is based on code from the nezha-dash project,
 * originally licensed under the Apache License 2.0.
 * The original license can be found in the LICENSE-APACHE file.
 *
 * Modifications made by AprilNEA <github@sku.moe>
 * Derived from: https://github.com/hamster1963/nezha-dash/raw/ac15be6e71ba9804681b1fe760fa245f94912372/components/loading/NetworkChartLoading.tsx
 * Licensed under the GNU General Public License v3.0 (GPLv3).
 */
import { Loader } from "@/components/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NetworkChartLoading() {
  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5">
          <CardTitle className="flex items-center gap-0.5 text-xl">
            <div className="aspect-auto h-[20px] w-24 bg-muted" />
          </CardTitle>
          <div className="mt-[2px] aspect-auto h-[14px] w-32 bg-muted" />
        </div>
        <div className="hidden pt-4 pr-4 sm:block">
          <Loader visible={true} />
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <div className="aspect-auto h-[250px] w-full" />
      </CardContent>
    </Card>
  );
}
