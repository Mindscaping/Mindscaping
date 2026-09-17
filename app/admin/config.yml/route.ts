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
  # ── Homepage ──
  - name: homepage
    label: "Homepage"
    files:
      - label: "Hero"
        name: hero
        file: content/hero.json
        fields:
          - { name: tagline, label: Tagline, widget: string }
          - { name: heading, label: Heading, widget: string }
          - { name: subtitle, label: Subtitle, widget: text }
          - { name: ctaPrimary, label: Primary CTA, widget: string }
          - { name: ctaSecondary, label: Secondary CTA, widget: string }
          - { name: quote, label: Quote, widget: text }
          - { name: specialisation, label: Specialisation, widget: string }
          - { name: spaces, label: Spaces, widget: string }
          - { name: approach, label: Approach, widget: string }

      - label: "About"
        name: about
        file: content/about.json
        fields:
          - { name: heading, label: Heading, widget: string }
          - { name: paragraphs, label: Paragraphs, widget: list, field: { name: paragraph, label: Paragraph, widget: string } }
          - { name: missionTitle, label: Mission Title, widget: string }
          - { name: missionText, label: Mission Text, widget: text }

      - label: "Values"
        name: values
        file: content/values.json
        fields:
          - { name: heading, label: Heading, widget: string }
          - { name: intro, label: Intro, widget: text }
          - name: items
            label: Values
            widget: list
            fields:
              - { name: num, label: Number, widget: string }
              - { name: title, label: Title, widget: string }
              - { name: text, label: Text, widget: text }

      - label: "Approach"
        name: approach
        file: content/approach.json
        fields:
          - { name: heading, label: Heading, widget: string }
          - { name: description, label: Description, widget: text }
          - { name: description2, label: Description 2, widget: text }
          - { name: quote, label: Quote, widget: text }
          - { name: ctaText, label: CTA Text, widget: string }
          - name: skills
            label: Skills
            widget: list
            fields:
              - { name: icon, label: Icon, widget: string }
              - { name: title, label: Title, widget: string }
              - { name: text, label: Text, widget: text }

      - label: "Process"
        name: process
        file: content/process.json
        fields:
          - { name: heading, label: Heading, widget: string }
          - name: steps
            label: Steps
            widget: list
            fields:
              - { name: num, label: Number, widget: string }
              - { name: icon, label: Icon, widget: string }
              - { name: title, label: Title, widget: string }
              - { name: text, label: Text, widget: text }

  # ── Other Pages ──
  - name: pages
    label: "Pages"
    files:
      - label: "Contact Page"
        name: contact
        file: content/contact.json
        fields:
          - { name: heading, label: Heading, widget: string }
          - { name: subheading, label: Subheading, widget: text }
          - { name: whatsappText, label: WhatsApp Text, widget: string }
          - { name: emailText, label: Email Text, widget: string }
          - { name: phoneText, label: Phone Text, widget: string }
          - { name: addressText, label: Address Text, widget: string }
          - { name: address, label: Address, widget: string }
          - { name: hours, label: Hours, widget: string }
          - { name: sessionTimings, label: Session Timings, widget: string }

      - label: "Privacy Policy"
        name: privacy
        file: content/privacy.json
        fields:
          - { name: heading, label: Heading, widget: string }
          - { name: lastUpdated, label: Last Updated, widget: string }
          - name: sections
            label: Sections
            widget: list
            fields:
              - { name: title, label: Title, widget: string }
              - { name: content, label: Content, widget: text }

      - label: "Footer"
        name: footer
        file: content/footer.json
        fields:
          - { name: aboutText, label: About Text, widget: text }
          - { name: email, label: Email, widget: string }
          - { name: phone, label: Phone, widget: string }
          - { name: address, label: Address, widget: string }
          - name: socialLinks
            label: Social Links
            widget: object
            fields:
              - { name: instagram, label: Instagram, widget: string }
              - { name: linkedin, label: LinkedIn, widget: string }
              - { name: youtube, label: YouTube, widget: string }

  # ── Content ──
  - name: content
    label: "Content"
    files:
      - label: "Team Members"
        name: team
        file: content/team.json
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

      - label: "FAQs"
        name: faq
        file: content/faq.json
        fields:
          - name: items
            label: FAQ Items
            widget: list
            fields:
              - { name: question, label: Question, widget: string }
              - { name: answer, label: Answer, widget: text }

      - label: "Testimonials"
        name: testimonials
        file: content/testimonials.json
        fields:
          - name: items
            label: Testimonials
            widget: list
            fields:
              - { name: name, label: Name, widget: string, required: false }
              - { name: quote, label: Quote, widget: text }
              - { name: featured, label: Featured, widget: boolean, default: true, required: false }

      - label: "Gallery"
        name: gallery
        file: content/gallery.json
        fields:
          - name: images
            label: Images
            widget: list
            fields:
              - { name: caption, label: Caption, widget: string, required: false }
              - { name: src, label: Image, widget: image }
              - { name: order, label: Order, widget: number, required: false }

  # ── Blog ──
  - name: blog
    label: "Blog"
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
