import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    // RSC
    BASE_URL: z.string().url().default("http://localhost:3000"),
    // API
    DATABASE_URL: z.string().url(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // Monitor styles
    NEXT_PUBLIC_SHOW_IP_INFO: z.boolean().default(true),
    NEXT_PUBLIC_SHOW_FLAG: z.boolean().default(true),
    NEXT_PUBLIC_SHOW_NETWORK_TRANSFER: z.boolean().default(true),
    NEXT_PUBLIC_FORCE_USE_SVG_FLAG: z.boolean().default(false),
    NEXT_PUBLIC_FIXED_TOP_SERVER_NAME: z.boolean().default(true),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BASE_URL: process.env.BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_FORCE_USE_SVG_FLAG: process.env.NEXT_PUBLIC_FORCE_USE_SVG_FLAG,
    NEXT_PUBLIC_SHOW_IP_INFO: process.env.NEXT_PUBLIC_SHOW_IP_INFO,
    NEXT_PUBLIC_SHOW_FLAG: process.env.NEXT_PUBLIC_SHOW_FLAG,
    NEXT_PUBLIC_SHOW_NETWORK_TRANSFER: process.env.NEXT_PUBLIC_SHOW_NET_TRANSFER,
    NEXT_PUBLIC_FIXED_TOP_SERVER_NAME:
      process.env.NEXT_PUBLIC_FIXED_TOP_SERVER_NAME,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
