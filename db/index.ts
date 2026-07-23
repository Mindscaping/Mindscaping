import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// ponytail: lazy init — avoids crash when DATABASE_URL not set during build
const getDb = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return drizzle(neon(url));
};

export const db = getDb();
