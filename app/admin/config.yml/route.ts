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
      - { name: body, label: Body, widget: markdown }

  - name: site-content
    label: Site Content
    files:
      - label: "Homepage Sections"
        name: "homepage"
        file: "content/site-content.json"
        fields:
          - name: hero
            label: Hero Section
            widget: object
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
          - name: about
            label: About Section
            widget: object
            fields:
              - { name: heading, label: Heading, widget: string }
              - { name: paragraphs, label: Paragraphs, widget: list, field: { name: text, label: Text, widget: text } }
              - { name: missionTitle, label: Mission Title, widget: string }
              - { name: missionText, label: Mission Text, widget: text }
          - name: values
            label: Values Section
            widget: object
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
          - name: approach
            label: Approach Section
            widget: object
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
          - name: process
            label: Process Section
            widget: object
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

  - name: site-footer
    label: Footer
    files:
      - label: "Footer Content"
        name: "footer"
        file: "content/site-footer.json"
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

  - name: site-contact
    label: Contact Page
    files:
      - label: "Contact Content"
        name: "contact"
        file: "content/site-contact.json"
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

  - name: site-privacy
    label: Privacy Policy
    files:
      - label: "Privacy Content"
        name: "privacy"
        file: "content/site-privacy.json"
        fields:
          - { name: heading, label: Heading, widget: string }
          - { name: lastUpdated, label: Last Updated, widget: string }
          - name: sections
            label: Sections
            widget: list
            fields:
              - { name: title, label: Title, widget: string }
              - { name: content, label: Content, widget: text }`;

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
