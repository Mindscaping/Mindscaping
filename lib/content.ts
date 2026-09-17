import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "content");

function readJSON(file: string) {
  return JSON.parse(fs.readFileSync(path.join(contentDir, file), "utf-8"));
}

function tryJSON(file: string) {
  try {
    return readJSON(file);
  } catch {
    return null;
  }
}

// ── Content collections ──

export function getTeamMembers() {
  const data = readJSON("team.json");
  return data.members || data;
}

export function getFaqs() {
  const data = readJSON("faq.json");
  return data.items || data;
}

export function getTestimonials() {
  const data = readJSON("testimonials.json");
  return data.items || data;
}

export function getGalleryImages() {
  const data = readJSON("gallery.json");
  return data.images || data;
}

export function getSchoolCounselling() {
  return tryJSON("school-counselling.json");
}

// ── Homepage sections ──

export function getHeroContent() {
  return tryJSON("hero.json");
}

export function getAboutContent() {
  return tryJSON("about.json");
}

export function getValuesContent() {
  return tryJSON("values.json");
}

export function getApproachContent() {
  return tryJSON("approach.json");
}

export function getProcessContent() {
  return tryJSON("process.json");
}

// ── Page content ──

export function getFooterContent() {
  return tryJSON("footer.json");
}

export function getContactContent() {
  return tryJSON("contact.json");
}

export function getPrivacyContent() {
  return tryJSON("privacy.json");
}

// ── Blog posts ──

export function getPosts() {
  const dir = path.join(contentDir, "blog");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(dir, f), "utf-8");
      const { data, content } = matter(raw);
      return { ...data, slug, content } as Record<string, unknown>;
    })
    .sort((a, b) => {
      const da = a.publishedAt ? new Date(a.publishedAt as string).getTime() : 0;
      const db = b.publishedAt ? new Date(b.publishedAt as string).getTime() : 0;
      return db - da;
    });
}

export function getPost(slug: string) {
  const file = path.join(contentDir, "blog", `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  return { ...data, slug, content };
}

export function getAllSlugs() {
  const dir = path.join(contentDir, "blog");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}
