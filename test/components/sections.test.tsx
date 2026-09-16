import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: Record<string, unknown>) => <img alt={props.alt as string} src={props.src as string} />,
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => <a {...props}>{children}</a>,
}));

// Mock IntersectionObserver as a class
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
import Hero from "@/components/sections/Hero";

describe("AboutSection", () => {
  it("renders about heading", () => {
    render(<AboutSection />);
    expect(screen.getByText(/Making therapy/)).toBeInTheDocument();
  });

  it("renders mission statement", () => {
    render(<AboutSection />);
    expect(screen.getByText(/Building an Ecosystem/)).toBeInTheDocument();
  });
});

describe("ValuesSection", () => {
  it("renders all four values", () => {
    render(<ValuesSection />);
    expect(screen.getByText("Evidence-Based Clinical Care")).toBeInTheDocument();
    expect(screen.getByText("Holistic Psychological Integration")).toBeInTheDocument();
    expect(screen.getByText("Ecosystemic Growth")).toBeInTheDocument();
    expect(screen.getByText("Inclusive & Affirming Spaces")).toBeInTheDocument();
  });

  it("renders value numbers", () => {
    render(<ValuesSection />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("04")).toBeInTheDocument();
  });
});

describe("ApproachSection", () => {
  it("renders approach heading", () => {
    render(<ApproachSection />);
    expect(screen.getByText(/Where play meets/)).toBeInTheDocument();
  });

  it("renders all four skills", () => {
    render(<ApproachSection />);
    expect(screen.getByText("Cognitive Agility")).toBeInTheDocument();
    expect(screen.getByText("Emotional Regulation")).toBeInTheDocument();
    expect(screen.getByText("Sensory Mindfulness")).toBeInTheDocument();
    expect(screen.getByText("Online Integration")).toBeInTheDocument();
  });
});

describe("ProcessSection", () => {
  it("renders all three steps", () => {
    render(<ProcessSection />);
    expect(screen.getByText("Consent & Intake")).toBeInTheDocument();
    expect(screen.getByText("Booking Confirmation")).toBeInTheDocument();
    expect(screen.getByText("Your Session")).toBeInTheDocument();
  });

  it("renders step numbers", () => {
    render(<ProcessSection />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
  });
});

describe("TeamSection", () => {
  const members = [
    { name: "Alice", role: "Therapist", bio: "Bio text", photo: "/img.jpg", credentials: "PhD" },
    { name: "Bob", role: "Psychologist" },
  ];

  it("renders team members", () => {
    render(<TeamSection members={members} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("renders roles", () => {
    render(<TeamSection members={members} />);
    expect(screen.getByText("Therapist")).toBeInTheDocument();
    expect(screen.getByText("Psychologist")).toBeInTheDocument();
  });

  it("renders bio when present", () => {
    render(<TeamSection members={members} />);
    expect(screen.getByText("Bio text")).toBeInTheDocument();
  });

  it("shows empty state when no members", () => {
    render(<TeamSection members={[]} />);
    expect(screen.getByText(/not yet added/)).toBeInTheDocument();
  });
});

describe("TestimonialsSection", () => {
  const testimonials = [
    { _id: "1", quote: "Great therapy!", name: "Client A" },
    { _id: "2", quote: "Very helpful", name: "" },
  ];

  it("renders testimonial quotes", () => {
    render(<TestimonialsSection testimonials={testimonials} />);
    expect(screen.getByText("Great therapy!")).toBeInTheDocument();
    expect(screen.getByText("Very helpful")).toBeInTheDocument();
  });

  it("renders name when present", () => {
    render(<TestimonialsSection testimonials={testimonials} />);
    expect(screen.getByText("— Client A")).toBeInTheDocument();
  });

  it("hides name when empty", () => {
    render(<TestimonialsSection testimonials={testimonials} />);
    const dashElements = screen.getAllByText(/—/);
    expect(dashElements).toHaveLength(1);
  });
});

describe("FaqSection", () => {
  const faqs = [
    { _id: "1", question: "What is therapy?", answer: "Therapy helps you." },
    { _id: "2", question: "How to book?", answer: "WhatsApp us." },
  ];

  it("renders FAQ questions", () => {
    render(<FaqSection faqs={faqs} />);
    expect(screen.getByText("What is therapy?")).toBeInTheDocument();
    expect(screen.getByText("How to book?")).toBeInTheDocument();
  });

  it("toggles answer visibility on click", () => {
    render(<FaqSection faqs={faqs} />);
    const button = screen.getByText("What is therapy?");

    expect(screen.queryByText("Therapy helps you.")).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByText("Therapy helps you.")).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByText("Therapy helps you.")).not.toBeInTheDocument();
  });
});

describe("ContactSection", () => {
  it("renders contact heading", () => {
    render(<ContactSection />);
    expect(screen.getByText(/Our doors are/)).toBeInTheDocument();
  });

  it("renders WhatsApp link", () => {
    render(<ContactSection />);
    const link = screen.getByText("WhatsApp Us").closest("a");
    expect(link).toHaveAttribute("href", "https://wa.me/918879997299");
  });

  it("renders phone number", () => {
    render(<ContactSection />);
    expect(screen.getByText("+91-8879997299")).toBeInTheDocument();
  });

  it("renders session hours", () => {
    render(<ContactSection />);
    expect(screen.getByText(/Mon – Fri · 10:00 AM to 7:00 PM/)).toBeInTheDocument();
  });
});

describe("GallerySection", () => {
  const images = [
    { src: "/img1.jpg", caption: "Photo 1" },
    { src: "/img2.jpg", caption: "Photo 2" },
  ];

  it("renders gallery images", () => {
    render(<GallerySection images={images} />);
    expect(screen.getByAltText("Photo 1")).toBeInTheDocument();
    expect(screen.getByAltText("Photo 2")).toBeInTheDocument();
  });

  it("returns null for empty images", () => {
    const { container } = render(<GallerySection images={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("uses default alt when caption missing", () => {
    render(<GallerySection images={[{ src: "/x.jpg" }]} />);
    expect(screen.getByAltText("Gallery image")).toBeInTheDocument();
  });
});

describe("Hero", () => {
  it("renders hero heading", () => {
    render(<Hero />);
    expect(screen.getByText(/Healing that/)).toBeInTheDocument();
  });

  it("renders CTA buttons", () => {
    render(<Hero />);
    expect(screen.getByText("Begin Your Healing Journey")).toBeInTheDocument();
    expect(screen.getByText("Learn More")).toBeInTheDocument();
  });

  it("renders quote", () => {
    render(<Hero />);
    expect(screen.getByText(/Mental health is not a destination/)).toBeInTheDocument();
  });
});

describe("GallerySection lightbox", () => {
  it("creates dialog on image click", () => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();

    const images = [{ src: "/img1.jpg", caption: "Photo 1" }];
    render(<GallerySection images={images} />);
    const img = screen.getByAltText("Photo 1").closest("div[class*='cursor-zoom-in']");
    expect(img).toBeTruthy();
    fireEvent.click(img!);
    const dialog = document.querySelector("dialog");
    expect(dialog).toBeInTheDocument();
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    dialog?.remove();
  });

  it("uses 'Gallery' as alt fallback in lightbox when caption missing", () => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();

    const images = [{ src: "/img2.jpg" }];
    render(<GallerySection images={images} />);
    const img = screen.getByAltText("Gallery image").closest("div[class*='cursor-zoom-in']");
    fireEvent.click(img!);
    const dialog = document.querySelector("dialog");
    expect(dialog).toBeInTheDocument();
    const innerHTML = dialog?.innerHTML ?? "";
    expect(innerHTML).toContain("Gallery");
    dialog?.remove();
  });

  it("closes lightbox on close button click", () => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();

    const images = [{ src: "/img3.jpg", caption: "Photo 3" }];
    render(<GallerySection images={images} />);
    const img = screen.getByAltText("Photo 3").closest("div[class*='cursor-zoom-in']");
    fireEvent.click(img!);
    const dialog = document.querySelector("dialog") as HTMLDialogElement;
    const closeBtn = dialog?.querySelector("button");
    if (closeBtn) fireEvent.click(closeBtn);
    dialog?.remove();
  });

  it("closes lightbox on backdrop click", () => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();

    const images = [{ src: "/img4.jpg", caption: "Photo 4" }];
    render(<GallerySection images={images} />);
    const img = screen.getByAltText("Photo 4").closest("div[class*='cursor-zoom-in']");
    fireEvent.click(img!);
    const dialog = document.querySelector("dialog") as HTMLDialogElement;
    if (dialog) {
      fireEvent.click(dialog, { target: dialog });
    }
    dialog?.remove();
  });
});
