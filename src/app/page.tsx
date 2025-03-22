import rscClient from "@/lib/rsc-client";
import { redirect } from "next/navigation";
import { getHostname } from "./[handle]/data";
import MonitorPageWrapper from "./[handle]/page.client";

export default async function Home() {
  const hostname = await getHostname() ?? undefined;
  const res = await rscClient.page.bind.$get({
    query: {
      hostname,
    },
  });
  
  if (res.status === 404) {
    redirect("/dash");
  }
  
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  
  const page = await res.json();
  
  return <MonitorPageWrapper page={page} />;
}
