import { defineType, defineField, defineArrayMember } from "sanity";

// ponytail: flat document types, no custom components — Sanity default UI is good enough

const teamMember = defineType({
  name: "teamMember",
  title: "Team Members",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r: any) => r.required() }),
    defineField({ name: "role", type: "string", title: "Role / Credentials" }),
    defineField({ name: "credentials", type: "string", title: "Additional Credentials" }),
    defineField({ name: "bio", type: "text", rows: 5 }),
    defineField({ name: "photo", type: "image" }),
    defineField({ name: "order", type: "number" }),
  ],
  orderings: [{ name: "order", title: "Order", by: [{ field: "order", direction: "asc" }] }],
});

const faq = defineType({
  name: "faq",
  title: "FAQs",
  type: "document",
  fields: [
    defineField({ name: "question", type: "string", validation: (r: any) => r.required() }),
    defineField({ name: "answer", type: "text", rows: 5 }),
  ],
});

const testimonial = defineType({
  name: "testimonial",
  title: "Testimonials",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string" }),
    defineField({ name: "quote", type: "text", rows: 4, validation: (r: any) => r.required() }),
    defineField({ name: "featured", type: "boolean" }),
  ],
});

const galleryImage = defineType({
  name: "galleryImage",
  title: "Gallery",
  type: "document",
  fields: [
    defineField({ name: "image", type: "image", validation: (r: any) => r.required() }),
    defineField({ name: "caption", type: "string" }),
    defineField({ name: "order", type: "number" }),
  ],
});

const post = defineType({
  name: "post",
  title: "Blog Posts",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r: any) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (r: any) => r.required() }),
    defineField({ name: "excerpt", type: "text", rows: 2 }),
    defineField({ name: "content", type: "array", of: [defineArrayMember({ type: "block" })] }),
    defineField({ name: "featuredImage", type: "image" }),
    defineField({ name: "publishedAt", type: "datetime" }),
    defineField({ name: "author", type: "string" }),
  ],
  orderings: [{ name: "publishedAt", title: "Published At", by: [{ field: "publishedAt", direction: "desc" }] }],
});

export const schemaTypes = [teamMember, faq, testimonial, galleryImage, post];
