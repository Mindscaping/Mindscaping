import { describe, it, expect } from "vitest";
import config from "../vitest.config";

// The exclude list must keep vitest's defaults (which exclude node_modules);
// replacing them makes the runner execute dependencies' own test files.
describe("vitest.config", () => {
  const exclude = config.test?.exclude || [];

  it("keeps vitest's default excludes (node_modules)", () => {
    expect(exclude.some((p) => p.includes("node_modules"))).toBe(true);
  });

  it("excludes Playwright specs", () => {
    expect(exclude).toContain("tests/**/*.spec.ts");
  });
});
