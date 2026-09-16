import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import JsonLd from "@/components/JsonLd";

describe("JsonLd", () => {
  it("renders script tag with correct type", () => {
    const { container } = render(<JsonLd />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
  });

  it("contains valid JSON-LD with Physician schema", () => {
    const { container } = render(<JsonLd />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script!.innerHTML);
    expect(data["@type"]).toBe("Physician");
    expect(data.name).toBe("Mindscaping");
    expect(data.url).toBe("https://mindscaping.in");
    expect(data.telephone).toBe("+918879997299");
  });

  it("includes opening hours", () => {
    const { container } = render(<JsonLd />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script!.innerHTML);
    expect(data.openingHoursSpecification).toHaveLength(1);
    expect(data.openingHoursSpecification[0].dayOfWeek).toContain("Monday");
  });
});
