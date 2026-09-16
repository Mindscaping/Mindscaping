// ponytail: in-memory pub/sub — swap to Redis when scaling beyond single instance
type Listener = (event: AppEvent) => void;

export interface AppEvent {
  type: "booking" | "content" | "notification";
  data: Record<string, unknown>;
  timestamp: string;
}

const listeners = new Set<Listener>();
const recentEvents: AppEvent[] = [];
const MAX_RECENT = 50;

export function publishEvent(type: AppEvent["type"], data: Record<string, unknown>): AppEvent {
  const event: AppEvent = {
    type,
    data,
    timestamp: new Date().toISOString(),
  };
  recentEvents.push(event);
  if (recentEvents.length > MAX_RECENT) recentEvents.shift();
  listeners.forEach((fn) => fn(event));
  return event;
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getRecentEvents(): AppEvent[] {
  return [...recentEvents];
}

export function getListenerCount(): number {
  return listeners.size;
}
