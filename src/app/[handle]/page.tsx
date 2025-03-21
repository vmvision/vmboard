import MonitorPageWrapper from "./page.client";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import rscClient from "@/lib/rsc-client";

type Params = Promise<{ handle: string }>;

export default async function Page({ params }: { params: Params }) {
  const hostname = new URL(
    `http://${(await headers()).get("host") ?? "localhost"}`,
  ).hostname;
  const handle = (await params).handle;
  const page = await rscClient.page.bind
    .$get({
      query: {
        handle,
        hostname: hostname !== "localhost" ? hostname : undefined,
      },
    })
    .then((res) => res.json());

  if (!page) {
    notFound();
  }

  return <MonitorPageWrapper page={page} />;
}
