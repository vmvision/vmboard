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
    HOSTNAME: z.string().default("0.0.0.0"),
    PORT: z.coerce.number().default(3000),
    BASE_URL: z.string().url().optional(),
    INTERNAL_URL: z.string().url().default("http://localhost:3000"),
    // Database
    DATABASE_URL: z.string().url(),

    // Auth
    ENABLE_EMAIL_VERIFICATION: z.boolean().default(false),
    RESEND_API_KEY: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    CF_TURNSTILE_SECRET_KEY: z.string().optional(),

    // Cloud
    DOCS_BASE: z.string().optional(),
    CLOUD_HOST: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // Auth
    NEXT_PUBLIC_ALLOW_OAUTH: z.string().transform((val) => val?.split(",")).default(""),
    NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY: z.string().optional(),

  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    HOSTNAME: process.env.HOSTNAME,
    PORT: process.env.PORT,
    BASE_URL: process.env.BASE_URL,
    INTERNAL_URL: process.env.INTERNAL_URL,
    DATABASE_URL: process.env.DATABASE_URL,

    ENABLE_EMAIL_VERIFICATION: process.env.ENABLE_EMAIL_VERIFICATION,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_ALLOW_OAUTH: process.env.NEXT_PUBLIC_ALLOW_OAUTH,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY:
      process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY,
    CF_TURNSTILE_SECRET_KEY: process.env.CF_TURNSTILE_SECRET_KEY,
    
    DOCS_BASE: process.env.DOCS_BASE,
    CLOUD_HOST: process.env.CLOUD_HOST,
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
