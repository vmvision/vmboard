import MonitorPageWrapper from "./page.client";
import rscClient from "@/lib/rsc-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHostname } from "./data";

type Params = Promise<{ handle: string }>;

const NotFound = () => {
  return (
    <Card className="mx-auto mt-16 w-96">
      <CardHeader>
        <CardTitle>Page not found</CardTitle>
      </CardHeader>
      <CardContent>
        <p>The page you are looking for does not exist.</p>
      </CardContent>
    </Card>
  );
};

export default async function Page({ params }: { params: Params }) {
  const hostname = (await getHostname()) ?? undefined;
  const handle = (await params).handle;

  const res = await rscClient.page.bind.$get({
    query: {
      handle,
      hostname: hostname,
    },
  });

  if (res.status === 404) {
    return <NotFound />;
  }

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const page = await res.json();

  return <MonitorPageWrapper page={page} />;
}
