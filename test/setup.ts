import "@testing-library/jest-dom/vitest";

Element.prototype.scrollIntoView = vi.fn();
Element.prototype.scrollTo = vi.fn();
