import { describe, it, expect, vi } from "vitest";

vi.mock("fs", async (importOriginal) => {
  const orig = await importOriginal<typeof import("fs")>();
  const mockContent: Record<string, string> = {
    "team.json": JSON.stringify({ members: [{ name: "Test", role: "Therapist", bio: "Bio" }] }),
    "faq.json": JSON.stringify({ items: [{ question: "Q1?", answer: "A1" }] }),
    "testimonials.json": JSON.stringify({ items: [{ quote: "Great!", featured: true }] }),
    "gallery.json": JSON.stringify({ images: [{ caption: "Photo", src: "/img.jpg" }] }),
    "hero.json": JSON.stringify({ heading: "Hero", tagline: "Tag", subtitle: "Sub" }),
    "about.json": JSON.stringify({ heading: "About", paragraphs: ["P1", "P2"], missionTitle: "Mission", missionText: "Text" }),
    "values.json": JSON.stringify({ heading: "Values", intro: "Intro", items: [{ num: "01", title: "V1", text: "T1" }] }),
    "approach.json": JSON.stringify({ heading: "Approach", description: "Desc", skills: [{ icon: "x", title: "S1", text: "T1" }] }),
    "process.json": JSON.stringify({ heading: "Process", steps: [{ num: "01", icon: "y", title: "Step", text: "T" }] }),
    "footer.json": JSON.stringify({ aboutText: "Footer", email: "test@test.com" }),
    "contact.json": JSON.stringify({ heading: "Contact", subheading: "Sub" }),
    "privacy.json": JSON.stringify({ heading: "Privacy", sections: [{ title: "S1", content: "C1" }] }),
    "school-counselling.json": JSON.stringify({ heading: "School Counselling", subtitle: "Sub", description: "Desc", members: [] }),
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
  getHeroContent,
  getAboutContent,
  getValuesContent,
  getApproachContent,
  getProcessContent,
  getFooterContent,
  getContactContent,
  getPrivacyContent,
  getSchoolCounselling,
} from "@/lib/content";

describe("content lib — all functions", () => {
  it("getTeamMembers returns members array", () => {
    const team = getTeamMembers();
    expect(team).toHaveLength(1);
    expect(team[0].name).toBe("Test");
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

  it("getHeroContent returns hero data", () => {
    const hero = getHeroContent();
    expect(hero).toBeTruthy();
    expect(hero.heading).toBe("Hero");
  });

  it("getAboutContent returns about data with paragraphs array", () => {
    const about = getAboutContent();
    expect(about).toBeTruthy();
    expect(about.paragraphs).toHaveLength(2);
    expect(about.paragraphs[0]).toBe("P1");
  });

  it("getValuesContent returns values with items", () => {
    const values = getValuesContent();
    expect(values).toBeTruthy();
    expect(values.items).toHaveLength(1);
  });

  it("getApproachContent returns approach with skills", () => {
    const approach = getApproachContent();
    expect(approach).toBeTruthy();
    expect(approach.skills).toHaveLength(1);
  });

  it("getProcessContent returns process with steps", () => {
    const process = getProcessContent();
    expect(process).toBeTruthy();
    expect(process.steps).toHaveLength(1);
  });

  it("getFooterContent returns footer data", () => {
    const footer = getFooterContent();
    expect(footer).toBeTruthy();
    expect(footer.aboutText).toBe("Footer");
  });

  it("getContactContent returns contact data", () => {
    const contact = getContactContent();
    expect(contact).toBeTruthy();
    expect(contact.heading).toBe("Contact");
  });

  it("getPrivacyContent returns privacy data with sections", () => {
    const privacy = getPrivacyContent();
    expect(privacy).toBeTruthy();
    expect(privacy.sections).toHaveLength(1);
    expect(privacy.sections[0].title).toBe("S1");
  });

  it("getSchoolCounselling returns school counselling data", () => {
    const sc = getSchoolCounselling();
    expect(sc).toBeTruthy();
    expect(sc.heading).toBe("School Counselling");
    expect(sc.members).toHaveLength(0);
  });
});
