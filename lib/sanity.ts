import { safeFetch, safeFetchOne, client } from "@/sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

const builder = client ? createImageUrlBuilder(client) : null;

export function urlFor(source: unknown) {
  return builder ? builder.image(source as any) : null;
}

// ponytail: flat queries, no codegen — enough for 20 content items
export async function getTeamMembers() {
  return safeFetch(`*[_type == "teamMember"] | order(order asc)`);
}

export async function getFaqs() {
  return safeFetch(`*[_type == "faq"]`);
}

export async function getTestimonials() {
  return safeFetch(`*[_type == "testimonial"]`);
}

export async function getServices() {
  return safeFetch(`*[_type == "service"] | order(order asc)`);
}

export async function getGalleryImages() {
  return safeFetch(`*[_type == "galleryImage"] | order(order asc)`);
}

export async function getPage(slug: string) {
  return safeFetchOne(`*[_type == "page" && slug.current == $slug][0]`, { slug });
}

export async function getPosts() {
  return safeFetch(`*[_type == "post"] | order(publishedAt desc)`);
}

export async function getPost(slug: string) {
  return safeFetchOne(`*[_type == "post" && slug.current == $slug][0]`, { slug });
}

export async function getAllSlugs() {
  const pages = await safeFetch(`*[_type == "page"]{"slug": slug.current}`);
  const posts = await safeFetch(`*[_type == "post" && defined(slug.current)]{"slug": slug.current}`);
  return { pages, posts };
}
