"use client";

import { useSSE } from "@/hooks/useSSE";
import { useState } from "react";

export default function LiveNotifications() {
  const { events, connected, error } = useSSE();
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const bookingEvents = events.filter(
    (e) => e.type === "booking" && !dismissed.has(events.indexOf(e)),
  );

  const hasError = !connected && error;
  if (bookingEvents.length === 0 && !hasError) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm"
      role="status"
      aria-live="polite"
    >
      {!connected && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2 rounded-xl">
          {error}
        </div>
      )}
      {bookingEvents.map((event, i) => {
        const idx = events.indexOf(event);
        const name = (event.data.name as string) || "Someone";
        const sessionType = (event.data.sessionType as string) || "session";
        return (
          <div
            key={idx}
            className="bg-brand-brown text-brand-offwhite px-4 py-3 rounded-xl text-xs leading-relaxed shadow-lg flex items-start gap-3 animate-in slide-in-from-right"
          >
            <span className="text-lg flex-shrink-0">📋</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium">New booking request</p>
              <p className="opacity-75 mt-0.5">
                {name} — {sessionType.replace(/^\w/, (c) => c.toUpperCase())}
              </p>
            </div>
            <button
              onClick={() => setDismissed((prev) => new Set(prev).add(idx))}
              className="text-brand-offwhite/50 hover:text-brand-offwhite text-sm flex-shrink-0"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
