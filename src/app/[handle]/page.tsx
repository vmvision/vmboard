import { getPageData } from "@/app/_lib/queries";
import { use } from "react";
import MonitorPageWrapper from "./page.client";
import { notFound } from "next/navigation";

type Params = Promise<{ handle: string }>;

export default function Page({ params }: { params: Params }) {
  const handle = use(params).handle;
  const page = use(getPageData(handle));

  if (!page) {
    notFound();
  }

  return <MonitorPageWrapper page={page} />;
}
