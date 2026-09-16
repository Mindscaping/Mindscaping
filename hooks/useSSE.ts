"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { AppEvent } from "@/lib/events";

export function useSSE(url = "/api/events") {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as AppEvent;
        setEvents((prev) => [...prev.slice(-49), event]);
        setError(null);
      } catch {
        // ignore malformed events
      }
    };

    es.onopen = () => {
      setConnected(true);
      setError(null);
    };

    es.onerror = () => {
      setConnected(false);
      setError("Connection lost. Reconnecting...");
      es.close();
      // ponytail: reconnect after 3s — exponential backoff if needed later
      setTimeout(connect, 3000);
    };
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
    };
  }, [connect]);

  return { events, connected, error };
}
