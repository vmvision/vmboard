import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { twoFactor, admin, username } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";

export const auth = betterAuth({
  trustedOrigins: ["http://10.0.0.21:3000"],
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [username(), twoFactor(), passkey(), admin()],
  emailAndPassword: {
    enabled: true,
  },
});
