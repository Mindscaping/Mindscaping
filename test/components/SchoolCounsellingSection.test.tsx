import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

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

import SchoolCounsellingSection from "@/components/sections/SchoolCounsellingSection";

describe("SchoolCounsellingSection", () => {
  it("renders default heading when no content prop", () => {
    render(<SchoolCounsellingSection />);
    expect(screen.getByText("School Counselling")).toBeInTheDocument();
  });

  it("renders default subtitle", () => {
    render(<SchoolCounsellingSection />);
    expect(screen.getByText("Supporting young minds in educational institutions")).toBeInTheDocument();
  });

  it("renders custom heading from content prop", () => {
    render(<SchoolCounsellingSection content={{ heading: "Custom Title" }} />);
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("renders custom subtitle from content prop", () => {
    render(<SchoolCounsellingSection content={{ subtitle: "Custom Sub" }} />);
    expect(screen.getByText("Custom Sub")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<SchoolCounsellingSection content={{ description: "Our team helps students." }} />);
    expect(screen.getByText("Our team helps students.")).toBeInTheDocument();
  });

  it("does not render description paragraph when empty", () => {
    const { container } = render(<SchoolCounsellingSection content={{ description: "" }} />);
    const desc = container.querySelector("section p.leading-relaxed");
    expect(desc).not.toBeInTheDocument();
  });

  it("shows 'being assembled' when members empty", () => {
    render(<SchoolCounsellingSection content={{ members: [] }} />);
    expect(screen.getByText(/being assembled/)).toBeInTheDocument();
  });

  it("shows 'being assembled' when no content prop", () => {
    render(<SchoolCounsellingSection />);
    expect(screen.getByText(/being assembled/)).toBeInTheDocument();
  });

  it("renders member cards with name", () => {
    render(
      <SchoolCounsellingSection
        content={{ members: [{ name: "Alice", role: "Therapist", bio: "Helps kids" }] }}
      />,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders member role when present", () => {
    render(
      <SchoolCounsellingSection
        content={{ members: [{ name: "Alice", role: "Therapist" }] }}
      />,
    );
    expect(screen.getByText("Therapist")).toBeInTheDocument();
  });

  it("does not render role element when absent", () => {
    const { container } = render(
      <SchoolCounsellingSection
        content={{ members: [{ name: "Alice" }] }}
      />,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Therapist")).not.toBeInTheDocument();
  });

  it("renders member bio when present", () => {
    render(
      <SchoolCounsellingSection
        content={{ members: [{ name: "Alice", bio: "Expert in CBT" }] }}
      />,
    );
    expect(screen.getByText("Expert in CBT")).toBeInTheDocument();
  });

  it("renders photo with alt text when provided", () => {
    render(
      <SchoolCounsellingSection
        content={{ members: [{ name: "Alice", photo: "/alice.jpg" }] }}
      />,
    );
    expect(screen.getByAltText("Alice")).toBeInTheDocument();
  });

  it("renders placeholder icon when no photo", () => {
    const { container } = render(
      <SchoolCounsellingSection
        content={{ members: [{ name: "Alice" }] }}
      />,
    );
    expect(container.textContent).toContain("⊞");
  });

  it("section has id school-counselling", () => {
    const { container } = render(<SchoolCounsellingSection />);
    const section = container.querySelector("#school-counselling");
    expect(section).toBeInTheDocument();
  });

  it("hides assembled message when members present", () => {
    render(
      <SchoolCounsellingSection
        content={{ members: [{ name: "Alice" }] }}
      />,
    );
    expect(screen.queryByText(/being assembled/)).not.toBeInTheDocument();
  });

  it("renders multiple members", () => {
    render(
      <SchoolCounsellingSection
        content={{
          members: [
            { name: "Alice", role: "Therapist" },
            { name: "Bob", role: "Counselor" },
          ],
        }}
      />,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });
});
