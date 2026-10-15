import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => <a {...props}>{children}</a>,
}));

import NotFound from "@/app/not-found";

describe("NotFound", () => {
  it("renders 404 text", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders page not found heading", () => {
    render(<NotFound />);
    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<NotFound />);
    expect(screen.getByText(/doesn't exist/)).toBeInTheDocument();
  });

  it("renders Go Home link to /", () => {
    render(<NotFound />);
    const link = screen.getByText("Go Home").closest("a");
    expect(link).toHaveAttribute("href", "/");
  });

  it("Go Home link does not open in new tab", () => {
    render(<NotFound />);
    const link = screen.getByText("Go Home").closest("a");
    expect(link).not.toHaveAttribute("target", "_blank");
  });
});
