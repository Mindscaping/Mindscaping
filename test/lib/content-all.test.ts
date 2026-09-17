import { describe, it, expect, vi } from "vitest";

vi.mock("fs", async (importOriginal) => {
  const orig = await importOriginal<typeof import("fs")>();
  const mockContent: Record<string, string> = {
    "team.json": JSON.stringify({ members: [{ name: "Test", role: "Therapist", bio: "Bio" }] }),
    "faq.json": JSON.stringify({ items: [{ question: "Q1?", answer: "A1" }] }),
    "testimonials.json": JSON.stringify({ items: [{ quote: "Great!", featured: true }] }),
    "gallery.json": JSON.stringify({ images: [{ caption: "Photo", src: "/img.jpg" }] }),
    "site-content.json": JSON.stringify({ hero: { heading: "Test" }, about: { heading: "About" }, values: { heading: "Values" }, approach: { heading: "Approach" }, process: { heading: "Process" } }),
    "site-footer.json": JSON.stringify({ aboutText: "Footer", email: "a@b.com" }),
    "site-contact.json": JSON.stringify({ heading: "Contact", subheading: "Sub" }),
    "site-privacy.json": JSON.stringify({ heading: "Privacy", sections: [] }),
  };

  const mockReadFile = vi.fn().mockImplementation((p: string) => {
    const fileName = p.split("/").pop() || "";
    if (mockContent[fileName]) return mockContent[fileName];
    throw new Error("ENOENT");
  });

  return { ...orig, readFileSync: mockReadFile, default: { ...orig, readFileSync: mockReadFile } };
});

vi.mock("path", async (importOriginal) => {
  const orig = await importOriginal<typeof import("path")>();
  return { ...orig, join: (...args: string[]) => args.join("/") };
});

import {
  getTeamMembers,
  getFaqs,
  getTestimonials,
  getGalleryImages,
  getSiteContent,
  getFooterContent,
  getContactContent,
  getPrivacyContent,
} from "@/lib/content";

describe("content lib — all functions", () => {
  it("getTeamMembers returns members array", () => {
    expect(getTeamMembers()).toHaveLength(1);
    expect(getTeamMembers()[0].name).toBe("Test");
  });

  it("getFaqs returns items array", () => {
    expect(getFaqs()).toHaveLength(1);
    expect(getFaqs()[0].question).toBe("Q1?");
  });

  it("getTestimonials returns items array", () => {
    expect(getTestimonials()).toHaveLength(1);
  });

  it("getGalleryImages returns images array", () => {
    expect(getGalleryImages()).toHaveLength(1);
  });

  it("getSiteContent returns all sections", () => {
    const content = getSiteContent();
    expect(content).toBeTruthy();
    expect(content?.hero?.heading).toBe("Test");
    expect(content?.about?.heading).toBe("About");
    expect(content?.values?.heading).toBe("Values");
    expect(content?.approach?.heading).toBe("Approach");
    expect(content?.process?.heading).toBe("Process");
  });

  it("getFooterContent returns footer data", () => {
    const footer = getFooterContent();
    expect(footer).toBeTruthy();
    expect(footer?.aboutText).toBe("Footer");
  });

  it("getContactContent returns contact data", () => {
    const contact = getContactContent();
    expect(contact).toBeTruthy();
    expect(contact?.heading).toBe("Contact");
  });

  it("getPrivacyContent returns privacy data", () => {
    const privacy = getPrivacyContent();
    expect(privacy).toBeTruthy();
    expect(privacy?.heading).toBe("Privacy");
  });
});
