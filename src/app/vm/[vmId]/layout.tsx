import { MetricsDataProvider } from "@/components/monitor/vm-data-context";
import { getVM } from "@/app/_lib/queries";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ vmId: string }>;
}) => {
  const vmId = Number((await params).vmId);
  const vm = await getVM(vmId);
  return {
    title: vm?.nickname,
  };
};

export default function ServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
