/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { env } from './src/env.js';
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();

/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    authInterrupts: true
  },
  async rewrites() {
    if (!env.CLOUD_HOST) return [];
    return {
      beforeFiles: [
        {
          source: '/:path((?!api|dash|auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
          destination: `${env.DOCS_BASE}/:path*`,
          has: [
            {
              type: "host",
              value: env.CLOUD_HOST,
            },
          ],
        },
      ],
    }
  },
  serverExternalPackages: ["vmapi"],
  // Already doing linting and typechecking as separate tasks in CI
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default withNextIntl(nextConfig);
