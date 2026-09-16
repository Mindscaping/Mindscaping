import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/layout/Footer";

describe("Footer", () => {
  it("renders brand name", () => {
    render(<Footer />);
    expect(screen.getByText("Mind")).toBeInTheDocument();
    expect(screen.getByText("scaping")).toBeInTheDocument();
  });

  it("renders UDYAM registration without copyright year", () => {
    render(<Footer />);
    expect(screen.getByText(/UDYAM-MH-33-0518142/)).toBeInTheDocument();
    expect(screen.queryByText(/©/)).not.toBeInTheDocument();
    expect(screen.queryByText(/2024/)).not.toBeInTheDocument();
  });

  it("renders location", () => {
    render(<Footer />);
    expect(screen.getByText("Mumbai, India")).toBeInTheDocument();
  });
});
