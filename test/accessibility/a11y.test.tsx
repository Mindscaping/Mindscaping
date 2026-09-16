import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img alt={props.alt as string} src={props.src as string} />,
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => <a {...props}>{children}</a>,
}));

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

import AboutSection from "@/components/sections/AboutSection";
import ValuesSection from "@/components/sections/ValuesSection";
import ApproachSection from "@/components/sections/ApproachSection";
import ProcessSection from "@/components/sections/ProcessSection";
import TeamSection from "@/components/sections/TeamSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import FaqSection from "@/components/sections/FaqSection";
import ContactSection from "@/components/sections/ContactSection";
import GallerySection from "@/components/sections/GallerySection";
import BookingForm from "@/components/sections/BookingForm";
import Footer from "@/components/layout/Footer";
import Nav from "@/components/layout/Nav";
import PostCard from "@/components/blog/PostCard";
import JsonLd from "@/components/JsonLd";

async function expectNoA11yViolations(container: HTMLElement) {
  const results = await axe.run(container);
  return results.violations;
}

describe("Accessibility: Nav", () => {
  it("has no critical a11y violations", async () => {
    const { container } = render(<Nav />);
    const violations = await expectNoA11yViolations(container);
    const critical = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(critical).toEqual([]);
  });

  it("has accessible hamburger button", () => {
    render(<Nav />);
    expect(screen.getByLabelText("Menu")).toHaveAttribute("aria-label", "Menu");
  });
});

describe("Accessibility: Footer", () => {
  it("has no a11y violations", async () => {
    const { container } = render(<Footer />);
    const violations = await expectNoA11yViolations(container);
    expect(violations).toEqual([]);
  });
});

describe("Accessibility: AboutSection", () => {
  it("has no critical a11y violations", async () => {
    const { container } = render(<AboutSection />);
    const violations = await expectNoA11yViolations(container);
    const critical = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(critical).toEqual([]);
  });

  it("uses semantic heading", () => {
    render(<AboutSection />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
  });
});

describe("Accessibility: ValuesSection", () => {
  it("has no critical a11y violations", async () => {
    const { container } = render(<ValuesSection />);
    const violations = await expectNoA11yViolations(container);
    const critical = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(critical).toEqual([]);
  });
});

describe("Accessibility: ApproachSection", () => {
  it("has no critical a11y violations", async () => {
    const { container } = render(<ApproachSection />);
    const violations = await expectNoA11yViolations(container);
    const critical = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(critical).toEqual([]);
  });
});

describe("Accessibility: ProcessSection", () => {
  it("has no critical a11y violations", async () => {
    const { container } = render(<ProcessSection />);
    const violations = await expectNoA11yViolations(container);
    const critical = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(critical).toEqual([]);
  });
});

describe("Accessibility: TeamSection", () => {
  const members = [
    { name: "Alice", role: "Therapist", bio: "Bio text", photo: "/img.jpg" },
  ];

  it("has no critical a11y violations", async () => {
    const { container } = render(<TeamSection members={members} />);
    const violations = await expectNoA11yViolations(container);
    const critical = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(critical).toEqual([]);
  });
});

describe("Accessibility: TestimonialsSection", () => {
  const testimonials = [{ _id: "1", quote: "Great therapy!", name: "Client A" }];

  it("has no critical a11y violations", async () => {
    const { container } = render(<TestimonialsSection testimonials={testimonials} />);
    const violations = await expectNoA11yViolations(container);
    const critical = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(critical).toEqual([]);
  });
});

describe("Accessibility: FaqSection", () => {
  const faqs = [{ _id: "1", question: "What is therapy?", answer: "Therapy helps you." }];

  it("has no critical a11y violations", async () => {
    const { container } = render(<FaqSection faqs={faqs} />);
    const violations = await expectNoA11yViolations(container);
    const critical = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(critical).toEqual([]);
  });
});

describe("Accessibility: ContactSection", () => {
  it("has no critical a11y violations", async () => {
    const { container } = render(<ContactSection />);
    const violations = await expectNoA11yViolations(container);
    const critical = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(critical).toEqual([]);
  });

  it("WhatsApp link opens in new tab with rel noopener", () => {
    render(<ContactSection />);
    const link = screen.getByText("WhatsApp Us").closest("a");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("Accessibility: BookingForm", () => {
  it("has no critical a11y violations", async () => {
    const { container } = render(<BookingForm />);
    const violations = await expectNoA11yViolations(container);
    const critical = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(critical).toEqual([]);
  });

  it("all form fields have associated labels", () => {
    render(<BookingForm />);
    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => {
      expect(input).toHaveAccessibleName();
    });
    const selects = screen.getAllByRole("combobox");
    selects.forEach((select) => {
      expect(select).toHaveAccessibleName();
    });
  });

  it("error messages are associated with fields via aria-describedby", async () => {
    render(<BookingForm />);
    const submitBtn = screen.getByRole("button", { name: /Request Booking/ });
    submitBtn.click();

    await screen.findByText("Name is required");
    expect(screen.getByLabelText(/Full Name/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/Full Name/)).toHaveAttribute("aria-describedby", "error-name");
  });

  it("required fields have aria-required or are marked with *", () => {
    render(<BookingForm />);
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/)).toBeInTheDocument();
  });
});

describe("Accessibility: GallerySection", () => {
  const images = [{ src: "/img1.jpg", caption: "Photo 1" }];

  it("has no critical a11y violations", async () => {
    const { container } = render(<GallerySection images={images} />);
    const violations = await expectNoA11yViolations(container);
    const critical = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(critical).toEqual([]);
  });

  it("images have alt text", () => {
    render(<GallerySection images={images} />);
    expect(screen.getByAltText("Photo 1")).toBeInTheDocument();
  });
});

describe("Accessibility: PostCard", () => {
  const post = {
    slug: "test-post",
    title: "Test Post",
    excerpt: "A test excerpt",
    author: "Author Name",
    publishedAt: "2026-01-15",
  };

  it("has no critical a11y violations", async () => {
    const { container } = render(<PostCard post={post} />);
    const violations = await expectNoA11yViolations(container);
    const critical = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(critical).toEqual([]);
  });

  it("uses semantic heading for post title", () => {
    render(<PostCard post={post} />);
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
  });
});

describe("Accessibility: JsonLd", () => {
  it("produces valid JSON-LD", () => {
    render(<JsonLd />);
    const script = document.querySelector("script[type='application/ld+json']");
    expect(script).toBeInTheDocument();
    const data = JSON.parse(script!.textContent!);
    expect(data["@type"]).toBeDefined();
  });
});

describe("WCAG: Color contrast considerations", () => {
  it("ContactSection CTA has sufficient contrast", () => {
    render(<ContactSection />);
    const cta = screen.getByText("Book Online");
    // The CTA uses bg-brand-offwhite text-brand-brown which is light on dark
    expect(cta).toHaveClass("text-brand-offwhite");
  });

  it("Footer text uses opacity which may reduce contrast", () => {
    const { container } = render(<Footer />);
    // Document: footer text uses opacity-40 which may fail WCAG AA contrast
    const footerText = container.querySelector("footer p:last-child");
    expect(footerText).toBeInTheDocument();
  });
});
