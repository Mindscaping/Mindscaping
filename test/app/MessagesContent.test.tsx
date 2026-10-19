import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockPush = vi.fn();
const mockGet = vi.fn();
const stableRouter = { push: mockPush };

vi.mock("next/navigation", () => ({
  useRouter: () => stableRouter,
  useSearchParams: () => ({ get: mockGet }),
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

beforeEach(() => {
  mockGet.mockReturnValue(null);
});

const savedFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = savedFetch;
  vi.restoreAllMocks();
});

function mockAuthResp(user = { id: "u1", name: "Rahul", role: "patient" }) {
  return { ok: true, json: () => Promise.resolve({ user }) } as Response;
}

function mockConversationsResp(conversations: unknown[] = []) {
  return { ok: true, json: () => Promise.resolve({ conversations }) } as Response;
}

function mockMessagesResp(messages: unknown[] = []) {
  return { ok: true, json: () => Promise.resolve({ messages }) } as Response;
}

function setupFetch(...responses: Response[]) {
  const mock = vi.fn();
  for (const r of responses) {
    mock.mockResolvedValueOnce(r);
  }
  globalThis.fetch = mock as any;
}

import MessagesContent from "@/app/messages/MessagesContent";

describe("MessagesContent", () => {
  it("redirects to /login when not authenticated", async () => {
    setupFetch({ ok: true, json: () => Promise.resolve({ user: null }) } as Response);

    render(<MessagesContent />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("redirects to /login on fetch error", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network")) as any;

    render(<MessagesContent />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("shows loading state while fetching conversations", async () => {
    let resolveConversations!: (v: Response) => void;
    const mock = vi.fn()
      .mockResolvedValueOnce(mockAuthResp())
      .mockImplementationOnce(() => new Promise((r) => { resolveConversations = r; }));
    globalThis.fetch = mock as any;

    render(<MessagesContent />);
    await waitFor(() => {
      expect(screen.getByText("Loading conversations...")).toBeInTheDocument();
    });
    resolveConversations(mockConversationsResp([]));
    await waitFor(() => {
      expect(screen.queryByText("Loading conversations...")).not.toBeInTheDocument();
    });
  });

  it("shows empty state with WhatsApp link when no conversations", async () => {
    setupFetch(mockAuthResp(), mockConversationsResp([]));

    render(<MessagesContent />);
    await waitFor(() => {
      expect(screen.getByText("No conversations yet")).toBeInTheDocument();
    });
    const waLink = screen.getByText("Chat on WhatsApp").closest("a");
    expect(waLink).toHaveAttribute("href", "https://wa.me/918879997299");
    expect(waLink).toHaveAttribute("target", "_blank");
  });

  it("renders conversation list with names", async () => {
    setupFetch(
      mockAuthResp(),
      mockConversationsResp([
        {
          otherUser: { id: "c1", name: "Dr. Priya", role: "clinician" },
          lastMessage: { content: "Hello", sender: { name: "Dr. Priya" }, createdAt: "2026-01-01T10:00:00Z" },
          unread: 2,
        },
      ]),
    );

    render(<MessagesContent />);
    await waitFor(() => {
      expect(screen.getByText("Dr. Priya")).toBeInTheDocument();
    });
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows Messages heading", async () => {
    setupFetch(mockAuthResp(), mockConversationsResp([]));

    render(<MessagesContent />);
    await waitFor(() => {
      expect(screen.getAllByText("Messages").length).toBeGreaterThan(0);
    });
  });

  it("Dashboard link points to patient dashboard for patient role", async () => {
    setupFetch(mockAuthResp(), mockConversationsResp([]));

    render(<MessagesContent />);
    await waitFor(() => {
      const dashLink = screen.getByText("Dashboard").closest("a");
      expect(dashLink).toHaveAttribute("href", "/dashboard/patient");
    });
  });

  it("opens conversation view when withUserId is set", async () => {
    mockGet.mockReturnValue("c1");
    setupFetch(
      mockAuthResp(),
      mockConversationsResp([
        { otherUser: { id: "c1", name: "Dr. Priya", role: "clinician" } },
      ]),
      mockMessagesResp([
        {
          id: "m1",
          content: "Hello there",
          sender: { id: "c1", name: "Dr. Priya" },
          receiver: { id: "u1", name: "Rahul" },
          createdAt: "2026-01-01T10:00:00Z",
          read: true,
        },
      ]),
    );

    render(<MessagesContent />);
    await waitFor(() => {
      expect(screen.getByText("Hello there")).toBeInTheDocument();
    });
  });

  it("shows back link to /messages", async () => {
    mockGet.mockReturnValue("c1");
    setupFetch(
      mockAuthResp(),
      mockConversationsResp([
        { otherUser: { id: "c1", name: "Dr. Priya", role: "clinician" } },
      ]),
      mockMessagesResp([]),
    );

    render(<MessagesContent />);
    await waitFor(() => {
      const backLink = screen.getByText("←");
      expect(backLink.closest("a")).toHaveAttribute("href", "/messages");
    });
  });

  it("shows empty messages text in conversation view", async () => {
    mockGet.mockReturnValue("c1");
    setupFetch(
      mockAuthResp(),
      mockConversationsResp([
        { otherUser: { id: "c1", name: "Dr. Priya", role: "clinician" } },
      ]),
      mockMessagesResp([]),
    );

    render(<MessagesContent />);
    await waitFor(() => {
      expect(screen.getByText("No messages yet. Say hello!")).toBeInTheDocument();
    });
  });

  it("sends message via form", async () => {
    mockGet.mockReturnValue("c1");
    setupFetch(
      mockAuthResp(),
      mockConversationsResp([
        { otherUser: { id: "c1", name: "Dr. Priya", role: "clinician" } },
      ]),
      mockMessagesResp([]),
      { ok: true, json: () => Promise.resolve({}) } as Response,
      mockMessagesResp([]),
    );

    render(<MessagesContent />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Type a message..."), {
      target: { value: "Hi Dr. Priya" },
    });
    fireEvent.click(screen.getByText("Send"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/messages",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("disables Send button when input is empty", async () => {
    mockGet.mockReturnValue("c1");
    setupFetch(
      mockAuthResp(),
      mockConversationsResp([
        { otherUser: { id: "c1", name: "Dr. Priya", role: "clinician" } },
      ]),
      mockMessagesResp([]),
    );

    render(<MessagesContent />);
    await waitFor(() => {
      expect(screen.getByText("Send")).toBeDisabled();
    });
  });

  it("renders nothing before user is loaded", async () => {
    let resolveUser!: (v: Response) => void;
    globalThis.fetch = vi.fn().mockImplementationOnce(
      () => new Promise((r) => { resolveUser = r; }),
    ) as any;

    const { container } = render(<MessagesContent />);
    expect(container.innerHTML).toBe("");
    resolveUser({ ok: true, json: () => Promise.resolve({ user: null }) } as Response);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it("shows conversation last message preview", async () => {
    setupFetch(
      mockAuthResp(),
      mockConversationsResp([
        {
          otherUser: { id: "c1", name: "Dr. Priya", role: "clinician" },
          lastMessage: { content: "See you Monday", sender: { name: "Dr. Priya" }, createdAt: "2026-01-01T10:00:00Z" },
          unread: 0,
        },
      ]),
    );

    render(<MessagesContent />);
    await waitFor(() => {
      expect(screen.getByText(/See you Monday/)).toBeInTheDocument();
    });
  });
});
