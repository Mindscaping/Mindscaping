import { describe, it, expect, vi } from "vitest";

vi.mock("@prisma/client", () => ({
  PrismaClient: class {
    user = { findUnique: vi.fn() };
  },
}));

import { prisma } from "@/lib/db";

describe("db lib", () => {
  it("exports a prisma client instance", () => {
    expect(prisma).toBeDefined();
  });

  it("prisma is a singleton on globalThis", () => {
    const stored = (globalThis as any).prisma;
    expect(stored).toBe(prisma);
  });
});
