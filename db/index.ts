import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// ponytail: lazy init — pass schema so Better Auth adapter can find tables
const getDb = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return drizzle(neon(url), { schema });
};

export const db = getDb();
