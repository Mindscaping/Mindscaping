import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { act } from "react";

// Mock IntersectionObserver - capture callback for manual invocation
let observerCallback: ((entries: IntersectionObserverEntry[]) => void) | null = null;
let observeSpy: ReturnType<typeof vi.fn>;
let disconnectSpy: ReturnType<typeof vi.fn>;
let unobserveSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  observerCallback = null;
  observeSpy = vi.fn();
  disconnectSpy = vi.fn();
  unobserveSpy = vi.fn();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: (entries: IntersectionObserverEntry[]) => void) {
        observerCallback = cb;
      }
      observe = observeSpy;
      unobserve = unobserveSpy;
      disconnect = disconnectSpy;
    },
  );
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

import { useReveal } from "@/hooks/useReveal";

function TestComponent() {
  const ref = useReveal();
  return (
    <div ref={ref}>
      <div className="reveal">Item 1</div>
      <div className="reveal">Item 2</div>
    </div>
  );
}

describe("useReveal", () => {
  it("returns a ref that attaches to a DOM element", () => {
    const { container } = render(<TestComponent />);
    expect(container.firstChild).toBeTruthy();
  });

  it("creates IntersectionObserver on mount and observes elements", () => {
    render(<TestComponent />);
    expect(observeSpy).toHaveBeenCalled();
  });

  it("disconnects observer on unmount", () => {
    const { unmount } = render(<TestComponent />);
    unmount();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it("adds 'visible' class when element intersects", () => {
    const { container } = render(<TestComponent />);
    const revealEls = container.querySelectorAll(".reveal");
    expect(revealEls[0].classList.contains("visible")).toBe(false);

    const mockEntry = {
      isIntersecting: true,
      target: revealEls[0],
    } as unknown as IntersectionObserverEntry;

    act(() => {
      observerCallback!([mockEntry]);
    });

    // The setTimeout fires after the callback
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(revealEls[0].classList.contains("visible")).toBe(true);
  });

  it("unobserves element after it becomes visible", () => {
    const { container } = render(<TestComponent />);
    const revealEls = container.querySelectorAll(".reveal");

    const mockEntry = {
      isIntersecting: true,
      target: revealEls[0],
    } as unknown as IntersectionObserverEntry;

    act(() => {
      observerCallback!([mockEntry]);
    });

    expect(unobserveSpy).toHaveBeenCalledWith(revealEls[0]);
  });

  it("does not add 'visible' class when not intersecting", () => {
    const { container } = render(<TestComponent />);
    const revealEls = container.querySelectorAll(".reveal");

    const mockEntry = {
      isIntersecting: false,
      target: revealEls[0],
    } as unknown as IntersectionObserverEntry;

    act(() => {
      observerCallback!([mockEntry]);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(revealEls[0].classList.contains("visible")).toBe(false);
  });

  it("handles multiple intersecting entries with staggered delay", () => {
    const { container } = render(<TestComponent />);
    const revealEls = container.querySelectorAll(".reveal");

    const entries = [
      { isIntersecting: true, target: revealEls[0] },
      { isIntersecting: true, target: revealEls[1] },
    ] as unknown as IntersectionObserverEntry[];

    act(() => {
      observerCallback!(entries);
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(revealEls[0].classList.contains("visible")).toBe(true);
    expect(revealEls[1].classList.contains("visible")).toBe(true);
  });
});
