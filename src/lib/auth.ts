import db from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { twoFactor, admin, username, captcha } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { env } from "@/env";
import { expo } from "@better-auth/expo";

const trustedOrigins = [];
if (env.BASE_URL) {
  trustedOrigins.push(env.BASE_URL);
}
export const auth = betterAuth({
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [
    username(),
    twoFactor(),
    passkey(),
    admin(),
    expo(),
    env.CF_TURNSTILE_SECRET_KEY &&
      captcha({
        provider: "cloudflare-turnstile",
        secretKey: env.CF_TURNSTILE_SECRET_KEY,
      }),
  ].filter(Boolean),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: env.ENABLE_EMAIL_VERIFICATION,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
      allowDifferentEmails: true,
    },
  },
  socialProviders: {
    github: {
      enabled: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
      clientId: env.GITHUB_CLIENT_ID as string,
      clientSecret: env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      enabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
