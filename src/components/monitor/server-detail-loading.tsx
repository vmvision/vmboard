/*
 * This file is based on code from the nezha-dash project,
 * originally licensed under the Apache License 2.0.
 * The original license can be found in the LICENSE-APACHE file.
 *
 * Modifications made by AprilNEA <github@sku.moe>
 * Derived from: https://github.com/hamster1963/nezha-dash/raw/ac15be6e71ba9804681b1fe760fa245f94912372/components/loading/ServerDetailLoading.tsx
 * Licensed under the GNU General Public License v3.0 (GPLv3).
 */
// import { BackIcon } from "@/components/Icon"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

export function ServerDetailChartLoading() {
  return (
    <div>
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[182px] w-full animate-none rounded-[5px] bg-muted-foreground/10" />
        <Skeleton className="h-[182px] w-full animate-none rounded-[5px] bg-muted-foreground/10" />
        <Skeleton className="h-[182px] w-full animate-none rounded-[5px] bg-muted-foreground/10" />
        <Skeleton className="h-[182px] w-full animate-none rounded-[5px] bg-muted-foreground/10" />
        <Skeleton className="h-[182px] w-full animate-none rounded-[5px] bg-muted-foreground/10" />
        <Skeleton className="h-[182px] w-full animate-none rounded-[5px] bg-muted-foreground/10" />
      </section>
    </div>
  )
}

export function ServerDetailLoading() {
  const router = useRouter()

  return (
    <>
      <div
        onClick={() => {
          router.push("/")
        }}
        className="flex flex-none cursor-pointer items-center gap-0.5 break-all font-semibold text-xl leading-none tracking-tight"
      >
        {/* <BackIcon /> */}
        <Skeleton className="h-[20px] w-24 animate-none rounded-[5px] bg-muted-foreground/10" />
      </div>
      <Skeleton className="mt-3 flex h-[81px] w-1/2 animate-none flex-wrap gap-2 rounded-[5px] bg-muted-foreground/10" />
    </>
  )
}