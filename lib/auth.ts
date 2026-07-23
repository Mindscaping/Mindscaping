import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/db";

// ponytail: skip Better Auth init when no DB (build or dev without env)
export const auth = db
  ? betterAuth({
      database: drizzleAdapter(db, { provider: "pg" }),
      emailAndPassword: { enabled: true },
      trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"].filter(Boolean),
    })
  : null;
