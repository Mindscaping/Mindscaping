import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

// Mock EventSource
class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  close = vi.fn();

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
    setTimeout(() => this.onopen?.(), 0);
  }

  simulateMessage(data: string) {
    this.onmessage?.({ data } as MessageEvent);
  }

  simulateError() {
    this.onerror?.();
  }
}

beforeEach(() => {
  MockEventSource.instances = [];
  vi.stubGlobal("EventSource", MockEventSource);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

import LiveNotifications from "@/components/sections/LiveNotifications";

describe("LiveNotifications", () => {
  it("renders nothing when no booking events", () => {
    const { container } = render(<LiveNotifications />);
    expect(container.innerHTML).toBe("");
  });

  it("renders notification for booking events", async () => {
    render(<LiveNotifications />);

    await act(async () => {
      vi.runAllTimers();
    });

    act(() => {
      MockEventSource.instances[0].simulateMessage(
        JSON.stringify({
          type: "booking",
          data: { name: "John", sessionType: "individual" },
          timestamp: "2026-01-01T00:00:00Z",
        }),
      );
    });

    expect(screen.getByText("New booking request")).toBeInTheDocument();
    expect(screen.getByText(/John/)).toBeInTheDocument();
  });

  it("displays session type capitalized", async () => {
    render(<LiveNotifications />);

    await act(async () => {
      vi.runAllTimers();
    });

    act(() => {
      MockEventSource.instances[0].simulateMessage(
        JSON.stringify({
          type: "booking",
          data: { name: "Jane", sessionType: "couples" },
          timestamp: "2026-01-01T00:00:00Z",
        }),
      );
    });

    expect(screen.getByText(/Couples/)).toBeInTheDocument();
  });

  it("dismisses notification on click", async () => {
    render(<LiveNotifications />);

    await act(async () => {
      vi.runAllTimers();
    });

    act(() => {
      MockEventSource.instances[0].simulateMessage(
        JSON.stringify({
          type: "booking",
          data: { name: "Test", sessionType: "group" },
          timestamp: "2026-01-01T00:00:00Z",
        }),
      );
    });

    expect(screen.getByText("New booking request")).toBeInTheDocument();

    const dismissBtn = screen.getByLabelText("Dismiss notification");
    fireEvent.click(dismissBtn);

    expect(screen.queryByText("New booking request")).not.toBeInTheDocument();
  });

  it("shows connection error", async () => {
    render(<LiveNotifications />);

    await act(async () => {
      vi.runAllTimers();
    });

    act(() => {
      MockEventSource.instances[0].simulateError();
    });

    // Wait for reconnection timeout
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText(/Connection lost/)).toBeInTheDocument();
  });

  it("has aria-live for screen readers", async () => {
    render(<LiveNotifications />);

    await act(async () => {
      vi.runAllTimers();
    });

    act(() => {
      MockEventSource.instances[0].simulateMessage(
        JSON.stringify({
          type: "booking",
          data: { name: "Test", sessionType: "individual" },
          timestamp: "2026-01-01T00:00:00Z",
        }),
      );
    });

    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
  });

  it("ignores non-booking events", async () => {
    render(<LiveNotifications />);

    await act(async () => {
      vi.runAllTimers();
    });

    act(() => {
      MockEventSource.instances[0].simulateMessage(
        JSON.stringify({
          type: "content",
          data: { title: "New post" },
          timestamp: "2026-01-01T00:00:00Z",
        }),
      );
    });

    expect(screen.queryByText("New booking request")).not.toBeInTheDocument();
  });
});
