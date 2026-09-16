import { describe, it, expect, vi, beforeEach } from "vitest";
import path from "path";

const readFileSync = vi.fn();
const existsSync = vi.fn();
const readdirSync = vi.fn();

vi.mock("fs", () => ({
  default: { readFileSync, existsSync, readdirSync },
}));

const contentDir = path.join(process.cwd(), "content");

describe("lib/content", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTeamMembers", () => {
    it("returns team members from JSON", async () => {
      const data = [{ name: "Test", role: "Dev" }];
      readFileSync.mockReturnValue(JSON.stringify(data));

      const { getTeamMembers } = await import("@/lib/content");
      const result = getTeamMembers();
      expect(result).toEqual(data);
      expect(readFileSync).toHaveBeenCalledWith(
        path.join(contentDir, "team.json"),
        "utf-8",
      );
    });
  });

  describe("getFaqs", () => {
    it("returns FAQs from JSON", async () => {
      const data = [{ question: "Q1", answer: "A1" }];
      readFileSync.mockReturnValue(JSON.stringify(data));

      const { getFaqs } = await import("@/lib/content");
      const result = getFaqs();
      expect(result).toEqual(data);
    });
  });

  describe("getTestimonials", () => {
    it("returns testimonials from JSON", async () => {
      const data = [{ quote: "Great!" }];
      readFileSync.mockReturnValue(JSON.stringify(data));

      const { getTestimonials } = await import("@/lib/content");
      const result = getTestimonials();
      expect(result).toEqual(data);
    });
  });

  describe("getGalleryImages", () => {
    it("returns gallery images from JSON", async () => {
      const data = [{ src: "/img.jpg", caption: "Test" }];
      readFileSync.mockReturnValue(JSON.stringify(data));

      const { getGalleryImages } = await import("@/lib/content");
      const result = getGalleryImages();
      expect(result).toEqual(data);
    });
  });

  describe("getPosts", () => {
    it("returns empty array when blog dir missing", async () => {
      existsSync.mockReturnValue(false);

      const { getPosts } = await import("@/lib/content");
      const result = getPosts();
      expect(result).toEqual([]);
    });

    it("returns parsed blog posts sorted by date", async () => {
      existsSync.mockReturnValue(true);
      readdirSync.mockReturnValue(["b.md", "a.md"]);

      const postA = `---\ntitle: A\npublishedAt: "2026-01-01"\n---\nContent A`;
      const postB = `---\ntitle: B\npublishedAt: "2026-06-01"\n---\nContent B`;

      readFileSync
        .mockReturnValueOnce(postA)
        .mockReturnValueOnce(postB);

      const { getPosts } = await import("@/lib/content");
      const result = getPosts();
      expect(result).toHaveLength(2);
      expect((result[0] as Record<string, unknown>).title).toBe("B");
      expect((result[1] as Record<string, unknown>).title).toBe("A");
    });

    it("handles posts without publishedAt", async () => {
      existsSync.mockReturnValue(true);
      readdirSync.mockReturnValue(["x.md"]);
      readFileSync.mockReturnValue(`---\ntitle: X\n---\nContent`);

      const { getPosts } = await import("@/lib/content");
      const result = getPosts();
      expect(result).toHaveLength(1);
      expect((result[0] as Record<string, unknown>).title).toBe("X");
    });

    it("sorts posts where only one has publishedAt", async () => {
      existsSync.mockReturnValue(true);
      readdirSync.mockReturnValue(["with-date.md", "no-date.md"]);

      const postDated = `---\ntitle: Dated\npublishedAt: "2026-06-01"\n---\nContent`;
      const postUndated = `---\ntitle: Undated\n---\nContent`;

      readFileSync
        .mockReturnValueOnce(postDated)
        .mockReturnValueOnce(postUndated);

      const { getPosts } = await import("@/lib/content");
      const result = getPosts();
      expect(result).toHaveLength(2);
      // Dated post should come first (newer), undated gets 0 timestamp
      expect((result[0] as Record<string, unknown>).title).toBe("Dated");
      expect((result[1] as Record<string, unknown>).title).toBe("Undated");
    });
  });

  describe("getPost", () => {
    it("returns null for non-existent slug", async () => {
      existsSync.mockReturnValue(false);

      const { getPost } = await import("@/lib/content");
      const result = getPost("missing");
      expect(result).toBeNull();
    });

    it("returns parsed post for valid slug", async () => {
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(
        `---\ntitle: Test Post\nauthor: Admin\n---\nHello world`,
      );

      const { getPost } = await import("@/lib/content");
      const result = getPost("test-post") as Record<string, unknown>;
      expect(result.title).toBe("Test Post");
      expect(result.author).toBe("Admin");
      expect(result.content).toBe("Hello world");
      expect(result.slug).toBe("test-post");
    });
  });

  describe("getAllSlugs", () => {
    it("returns empty array when blog dir missing", async () => {
      existsSync.mockReturnValue(false);

      const { getAllSlugs } = await import("@/lib/content");
      const result = getAllSlugs();
      expect(result).toEqual([]);
    });

    it("returns slugs from markdown files", async () => {
      existsSync.mockReturnValue(true);
      readdirSync.mockReturnValue([
        "post-one.md",
        "post-two.md",
        "not-md.txt",
      ]);

      const { getAllSlugs } = await import("@/lib/content");
      const result = getAllSlugs();
      expect(result).toEqual(["post-one", "post-two"]);
    });
  });
});
