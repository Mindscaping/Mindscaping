import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PostCard from "@/components/blog/PostCard";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: Record<string, unknown>) => <img alt={props.alt as string} src={props.src as string} />,
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => <a {...props}>{children}</a>,
}));

describe("PostCard", () => {
  const basePost = {
    title: "Test Post",
    slug: "test-post",
    excerpt: "A test excerpt",
    publishedAt: "2026-06-15",
    author: "Admin",
    featuredImage: "/images/test.jpg",
  };

  it("renders post title", () => {
    render(<PostCard post={basePost} />);
    expect(screen.getByText("Test Post")).toBeInTheDocument();
  });

  it("renders excerpt", () => {
    render(<PostCard post={basePost} />);
    expect(screen.getByText("A test excerpt")).toBeInTheDocument();
  });

  it("renders author", () => {
    render(<PostCard post={basePost} />);
    expect(screen.getByText("By Admin")).toBeInTheDocument();
  });

  it("renders formatted date", () => {
    render(<PostCard post={basePost} />);
    expect(screen.getByText(/June/)).toBeInTheDocument();
  });

  it("links to correct slug", () => {
    render(<PostCard post={basePost} />);
    const link = screen.getByText("Test Post").closest("a");
    expect(link).toHaveAttribute("href", "/blog/test-post");
  });

  it("renders featured image when provided", () => {
    render(<PostCard post={basePost} />);
    expect(screen.getByAltText("Test Post")).toBeInTheDocument();
  });

  it("renders without optional fields", () => {
    render(<PostCard post={{ title: "Minimal", slug: "min" }} />);
    expect(screen.getByText("Minimal")).toBeInTheDocument();
    expect(screen.queryByText(/By/)).not.toBeInTheDocument();
  });
});
