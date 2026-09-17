import { NextRequest, NextResponse } from "next/server";

const CONFIG = `backend:
  name: github
  repo: Mindscaping/Mindscaping
  branch: main
  base_url: ORIGIN_PLACEHOLDER
  auth_endpoint: api/auth

media_folder: public/images
public_folder: /images

collections:
  - name: team
    label: Team Members
    files:
      - label: "Team Members"
        name: "team"
        file: "content/team.json"
        fields:
          - name: members
            label: Members
            widget: list
            fields:
              - { name: name, label: Name, widget: string }
              - { name: role, label: Role, widget: string, required: false }
              - { name: credentials, label: Credentials, widget: string, required: false }
              - { name: bio, label: Bio, widget: text, required: false }
              - { name: photo, label: Photo, widget: image, required: false }
              - { name: order, label: Order, widget: number, required: false }

  - name: faq
    label: FAQs
    files:
      - label: "FAQs"
        name: "faq"
        file: "content/faq.json"
        fields:
          - name: items
            label: FAQ Items
            widget: list
            fields:
              - { name: question, label: Question, widget: string }
              - { name: answer, label: Answer, widget: text }

  - name: testimonials
    label: Testimonials
    files:
      - label: "Testimonials"
        name: "testimonials"
        file: "content/testimonials.json"
        fields:
          - name: items
            label: Testimonials
            widget: list
            fields:
              - { name: name, label: Name, widget: string, required: false }
              - { name: quote, label: Quote, widget: text }
              - { name: featured, label: Featured, widget: boolean, default: true, required: false }

  - name: gallery
    label: Gallery Images
    files:
      - label: "Gallery"
        name: "gallery"
        file: "content/gallery.json"
        fields:
          - name: images
            label: Images
            widget: list
            fields:
              - { name: caption, label: Caption, widget: string, required: false }
              - { name: src, label: Image, widget: image }
              - { name: order, label: Order, widget: number, required: false }

  - name: blog
    label: Blog Posts
    folder: content/blog
    extension: md
    format: frontmatter
    create: true
    slug: "{{slug}}"
    fields:
      - { name: title, label: Title, widget: string }
      - { name: excerpt, label: Excerpt, widget: text, required: false }
      - { name: featuredImage, label: Featured Image, widget: image, required: false }
      - { name: publishedAt, label: Published At, widget: datetime }
      - { name: author, label: Author, widget: string, default: "Mindscaping", required: false }
      - { name: body, label: Body, widget: markdown }`;

export function GET(req: NextRequest) {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const origin = forwardedHost
    ? `${forwardedProto || "https"}://${forwardedHost}`
    : req.nextUrl.origin;
  const yaml = CONFIG.replace("ORIGIN_PLACEHOLDER", origin);
  return new NextResponse(yaml, {
    headers: { "Content-Type": "text/yaml; charset=utf-8" },
  });
}
