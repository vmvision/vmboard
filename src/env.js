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
    PORT: z.coerce.number().default(3000),

    // RSC
    BASE_URL: z.string().url().default("http://localhost:3000"),

    // API
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url().optional(),

    // switch
    ENABLE_ALERT_QUEUE: z.boolean().default(false),
    ENABLE_EMAIL_VERIFICATION: z.boolean().default(false),

    // secret
    RESEND_API_KEY: z.string().optional(),

    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),

    CF_TURNSTILE_SECRET_KEY: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // Feature
    NEXT_PUBLIC_ALLOW_OAUTH: z.string().transform((val) => val?.split(",")).default(""),
    NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY: z.string().optional(),

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
    NODE_ENV: process.env.NODE_ENV,

    BASE_URL: process.env.BASE_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,

    // switch
    ENABLE_ALERT_QUEUE: process.env.ENABLE_ALERT_QUEUE,
    ENABLE_EMAIL_VERIFICATION: process.env.ENABLE_EMAIL_VERIFICATION,

    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,

    // secret
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CF_TURNSTILE_SECRET_KEY: process.env.CF_TURNSTILE_SECRET_KEY,

    NEXT_PUBLIC_ALLOW_OAUTH: process.env.NEXT_PUBLIC_ALLOW_OAUTH,
    NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY:
      process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY,

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
