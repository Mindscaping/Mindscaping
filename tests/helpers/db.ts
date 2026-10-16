import { execSync } from "child_process";
import { existsSync, copyFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(__dirname, "../..");
const DB_PATH = resolve(ROOT, "prisma/dev.db");
const TEST_DB_PATH = resolve(ROOT, "prisma/test.db");
const SEED_DB_PATH = resolve(ROOT, "prisma/seed.db");

export function resetDatabase(): void {
  if (existsSync(TEST_DB_PATH)) {
    execSync(`rm -f "${TEST_DB_PATH}"`);
  }
  if (existsSync(SEED_DB_PATH)) {
    copyFileSync(SEED_DB_PATH, TEST_DB_PATH);
  } else {
    execSync(
      `DATABASE_URL="file:./test.db" npx prisma db push --skip-generate --force-reset`,
      { cwd: ROOT, stdio: "pipe" }
    );
    if (existsSync(TEST_DB_PATH)) {
      copyFileSync(TEST_DB_PATH, SEED_DB_PATH);
    }
  }
}

export function seedDatabase(): void {
  execSync(
    `DATABASE_URL="file:./test.db" npx prisma db push --skip-generate`,
    { cwd: ROOT, stdio: "pipe" }
  );
  if (existsSync(TEST_DB_PATH) && !existsSync(SEED_DB_PATH)) {
    copyFileSync(TEST_DB_PATH, SEED_DB_PATH);
  }
}
