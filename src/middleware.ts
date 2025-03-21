import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { env } from "./env";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? request.nextUrl.host;
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    // Check if it's a subdomain by counting dots in host
    const isSubdomain = host.split(".").length > 2;
    if (isSubdomain) {
      const subdomain = host.split(".")[0];
      return NextResponse.rewrite(
        new URL(`/${subdomain}`, `http://${env.HOSTNAME}:${env.PORT}`),
      );
    }
  }

  // if (pathname.startsWith("/vm")) {
  //   return NextResponse.rewrite(
  //     new URL("/vm", `http://${env.HOSTNAME}:${env.PORT}`),
  //   );
  // }

  if (pathname.startsWith("/dash")) {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dash", "/dash/:path*"],
};
