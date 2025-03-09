import db from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { twoFactor, admin, username } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { env } from "@/env";

const trustedOrigins = [];
trustedOrigins.push(env.BASE_URL);

export const auth = betterAuth({
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [username(), twoFactor(), passkey(), admin()],
  emailAndPassword: {
    enabled: true,
  },
});


export type Session = typeof auth.$Infer.Session