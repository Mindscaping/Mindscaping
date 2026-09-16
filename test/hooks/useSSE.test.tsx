import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Mock EventSource
class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  close = vi.fn();
  readyState = 0;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
    // Simulate async open
    setTimeout(() => {
      this.readyState = 1;
      this.onopen?.();
    }, 0);
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

import { useSSE } from "@/hooks/useSSE";

describe("useSSE", () => {
  it("initializes with empty events and disconnected state", () => {
    const { result } = renderHook(() => useSSE());
    expect(result.current.events).toEqual([]);
    expect(result.current.connected).toBe(false);
  });

  it("creates EventSource on mount", () => {
    renderHook(() => useSSE());
    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0].url).toBe("/api/events");
  });

  it("uses custom URL", () => {
    renderHook(() => useSSE("/custom/events"));
    expect(MockEventSource.instances[0].url).toBe("/custom/events");
  });

  it("sets connected to true on open", async () => {
    const { result } = renderHook(() => useSSE());
    expect(result.current.connected).toBe(false);

    await act(async () => {
      vi.runAllTimers();
    });

    expect(result.current.connected).toBe(true);
  });

  it("adds events on message", async () => {
    const { result } = renderHook(() => useSSE());

    await act(async () => {
      vi.runAllTimers();
    });

    act(() => {
      MockEventSource.instances[0].simulateMessage(
        JSON.stringify({ type: "booking", data: { name: "Test" }, timestamp: "2026-01-01T00:00:00Z" }),
      );
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].type).toBe("booking");
  });

  it("sets error on EventSource error", async () => {
    const { result } = renderHook(() => useSSE());

    await act(async () => {
      vi.runAllTimers();
    });

    act(() => {
      MockEventSource.instances[0].simulateError();
    });

    expect(result.current.connected).toBe(false);
    expect(result.current.error).toBe("Connection lost. Reconnecting...");
  });

  it("reconnects after error", async () => {
    renderHook(() => useSSE());

    await act(async () => {
      vi.runAllTimers();
    });

    act(() => {
      MockEventSource.instances[0].simulateError();
    });

    expect(MockEventSource.instances).toHaveLength(1);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(MockEventSource.instances).toHaveLength(2);
  });

  it("closes EventSource on unmount", async () => {
    const { unmount } = renderHook(() => useSSE());

    await act(async () => {
      vi.runAllTimers();
    });

    const es = MockEventSource.instances[0];
    unmount();
    expect(es.close).toHaveBeenCalled();
  });

  it("limits events to 50", async () => {
    const { result } = renderHook(() => useSSE());

    await act(async () => {
      vi.runAllTimers();
    });

    for (let i = 0; i < 60; i++) {
      act(() => {
        MockEventSource.instances[0].simulateMessage(
          JSON.stringify({ type: "notification", data: { i }, timestamp: new Date().toISOString() }),
        );
      });
    }

    expect(result.current.events.length).toBeLessThanOrEqual(50);
  });
});
