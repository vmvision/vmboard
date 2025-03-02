import rscClient from "@/lib/rsc-client";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import TerminalSetupPage from "./page.client";
import { getVM, getSSHKey } from "@/app/_lib/queries";

type SearchParams = Promise<{ vmId: string }>;
export const generateMetadata = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const vmId = (await searchParams).vmId;
  const vm = await getVM(Number(vmId));
  // const res = await rscClient.vm[":id"]
  //   .$get({
  //     param: {
  //       id: vmId,
  //     },
  //   })
  //   .then((res) => res.json());
  return {
    title: vm?.nickname,
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
  const vm = await getVM(Number(vmId));
  if (!vm) {
    notFound();
  }
  if (!vm.sshInfo) {
    const sshKeys = await getSSHKey();
    return <TerminalSetupPage vm={vm} sshKeys={sshKeys} />;
  }
  return <Terminal vmId={vmId} className="rounded-none" />;
}
