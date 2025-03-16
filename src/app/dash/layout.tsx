import { auth } from "@/lib/auth";
import { getMessages } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";

export default async function DashLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/auth");
  }
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <main className="h-[calc(100vh-3.5rem-1px)] w-screen">{children}</main>
    </NextIntlClientProvider>
  );
}
