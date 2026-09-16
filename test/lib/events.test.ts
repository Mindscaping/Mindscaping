import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  publishEvent,
  subscribe,
  getRecentEvents,
  getListenerCount,
  type AppEvent,
} from "@/lib/events";

describe("lib/events", () => {
  beforeEach(() => {
    // Clear state between tests by resetting module
    // The in-memory store persists across tests which is fine for these tests
  });

  describe("publishEvent", () => {
    it("returns an event with correct structure", () => {
      const event = publishEvent("booking", { name: "Test" });
      expect(event.type).toBe("booking");
      expect(event.data).toEqual({ name: "Test" });
      expect(event.timestamp).toBeDefined();
      expect(new Date(event.timestamp).getTime()).not.toBeNaN();
    });

    it("stores recent events", () => {
      const event = publishEvent("notification", { msg: "hello" });
      const recent = getRecentEvents();
      expect(recent.some((e) => e.timestamp === event.timestamp)).toBe(true);
    });

    it("notifies subscribers", () => {
      const fn = vi.fn();
      subscribe(fn);
      publishEvent("content", { title: "New post" });
      expect(fn).toHaveBeenCalledWith(
        expect.objectContaining({ type: "content" }),
      );
    });
  });

  describe("subscribe", () => {
    it("returns an unsubscribe function", () => {
      const fn = vi.fn();
      const unsub = subscribe(fn);
      expect(typeof unsub).toBe("function");
      unsub();
    });

    it("stops notifications after unsubscribe", () => {
      const fn = vi.fn();
      const unsub = subscribe(fn);
      unsub();
      publishEvent("booking", { x: 1 });
      expect(fn).not.toHaveBeenCalled();
    });

    it("supports multiple subscribers", () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      subscribe(fn1);
      subscribe(fn2);
      publishEvent("notification", { y: 2 });
      expect(fn1).toHaveBeenCalled();
      expect(fn2).toHaveBeenCalled();
    });
  });

  describe("getRecentEvents", () => {
    it("returns an array", () => {
      expect(Array.isArray(getRecentEvents())).toBe(true);
    });

    it("returns a copy, not the original array", () => {
      const a = getRecentEvents();
      const b = getRecentEvents();
      expect(a).not.toBe(b);
    });
  });

  describe("getListenerCount", () => {
    it("returns current listener count", () => {
      const before = getListenerCount();
      const unsub = subscribe(() => {});
      expect(getListenerCount()).toBe(before + 1);
      unsub();
    });
  });
});
