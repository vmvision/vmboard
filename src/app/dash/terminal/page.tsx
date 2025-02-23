import rscClient from "@/lib/rsc-client";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

type SearchParams = Promise<{ vmId: string }>;
export const generateMetadata = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const vmId = (await searchParams).vmId;
  const res = await rscClient.vm[":id"]
    .$get({
      param: {
        id: vmId,
      },
    })
    .then((res) => res.json());
  return {
    title: res.name,
  };
};

const Terminal = dynamic(() => import("@/components/terminal"));

export default async function VMTerminalPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const vmId = (await searchParams).vmId;
  if (!vmId) {
    notFound();
  }
  return <Terminal vmId={vmId} className="rounded-none" />;
}
