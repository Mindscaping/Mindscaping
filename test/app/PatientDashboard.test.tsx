import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";

const mockPush = vi.fn();
const stableRouter = { push: mockPush };

vi.mock("next/navigation", () => ({
  useRouter: () => stableRouter,
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

function mockAuth(user = { id: "u1", name: "Rahul", role: "patient", email: "rahul@test.com" }) {
  return { ok: true, json: () => Promise.resolve({ user }) } as Response;
}

function mockSessions(sessions: unknown[] = []) {
  return { ok: true, json: () => Promise.resolve({ sessions }) } as Response;
}

function mockPayments(payments: unknown[] = []) {
  return { ok: true, json: () => Promise.resolve({ payments }) } as Response;
}

function mockBookings(bookings: unknown[] = []) {
  return { ok: true, json: () => Promise.resolve({ bookings }) } as Response;
}

function setupFetchChain(authResp: Response, sessionsResp: Response, paymentsResp: Response, bookingsResp: Response) {
  vi.mocked(fetch)
    .mockResolvedValueOnce(authResp)
    .mockResolvedValueOnce(sessionsResp)
    .mockResolvedValueOnce(paymentsResp)
    .mockResolvedValueOnce(bookingsResp);
}

async function flushPromises() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockAuth()));
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = "test_key";
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
});

import PatientDashboard from "@/app/dashboard/patient/page";

describe("PatientDashboard", () => {
  it("redirects to /login when not authenticated", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: null }),
    } as Response);

    render(<PatientDashboard />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("redirects to /login for non-patient role", async () => {
    vi.mocked(fetch).mockResolvedValue(mockAuth({ id: "u1", name: "Doc", role: "clinician", email: "d@t.com" }));

    render(<PatientDashboard />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("redirects to /login on fetch error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("fail"));

    render(<PatientDashboard />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("renders nothing while loading", async () => {
    let resolveAuth!: (v: Response) => void;
    vi.mocked(fetch).mockImplementationOnce(
      () => new Promise((r) => { resolveAuth = r; }),
    );

    const { container } = render(<PatientDashboard />);
    expect(container.innerHTML).toBe("");
    resolveAuth(mockAuth());
    await flushPromises();
  });

  it("shows welcome message with user name", async () => {
    setupFetchChain(mockAuth(), mockSessions(), mockPayments(), mockBookings());

    render(<PatientDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Welcome, Rahul/)).toBeInTheDocument();
    });
  });

  it("shows stats cards", async () => {
    setupFetchChain(
      mockAuth(),
      mockSessions([
        { id: "s1", date: "2026-10-01T10:00:00Z", type: "individual", status: "scheduled", clinician: { id: "c1", name: "Dr. Priya" } },
        { id: "s2", date: "2026-09-01T10:00:00Z", type: "individual", status: "completed", clinician: { id: "c1", name: "Dr. Priya" } },
      ]),
      mockPayments([
        { id: "p1", amount: 50000, status: "captured", createdAt: "2026-09-01T12:00:00Z", session: { id: "s2", date: "2026-09-01T10:00:00Z", type: "individual" } },
      ]),
      mockBookings(),
    );

    render(<PatientDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Total Paid")).toBeInTheDocument();
      expect(screen.getByText("My Bookings")).toBeInTheDocument();
    });
  });

  it("shows empty bookings with link to /book", async () => {
    setupFetchChain(mockAuth(), mockSessions(), mockPayments(), mockBookings());

    render(<PatientDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/No bookings yet/)).toBeInTheDocument();
    });
    const bookLink = screen.getByText("Book a session").closest("a");
    expect(bookLink).toHaveAttribute("href", "/book");
  });

  it("shows booking list with status badges", async () => {
    setupFetchChain(
      mockAuth(),
      mockSessions(),
      mockPayments(),
      mockBookings([
        {
          id: "b1", name: "Rahul", email: "rahul@test.com", phone: "9876543210",
          sessionType: "individual", preferredDate: "2026-10-01", preferredTime: "10:00",
          therapistPreference: "No preference", notes: null, status: "pending", createdAt: "2026-09-28T10:00:00Z",
        },
      ]),
    );

    render(<PatientDashboard />);
    await waitFor(() => {
      expect(screen.getByText("pending")).toBeInTheDocument();
    });
    expect(screen.getByText("My Bookings")).toBeInTheDocument();
  });

  it("shows confirmed booking badge", async () => {
    setupFetchChain(
      mockAuth(),
      mockSessions(),
      mockPayments(),
      mockBookings([
        {
          id: "b1", name: "Rahul", email: "rahul@test.com", phone: "9876543210",
          sessionType: "couples", preferredDate: "2026-10-01", preferredTime: "10:00",
          therapistPreference: "No preference", notes: null, status: "confirmed", createdAt: "2026-09-28T10:00:00Z",
        },
      ]),
    );

    render(<PatientDashboard />);
    await waitFor(() => {
      const badge = screen.getByText("confirmed");
      expect(badge).toHaveClass("bg-green-100");
    });
  });

  it("shows upcoming sessions with clinician name", async () => {
    setupFetchChain(
      mockAuth(),
      mockSessions([
        { id: "s1", date: "2026-10-01T10:00:00Z", type: "individual", status: "scheduled", clinician: { id: "c1", name: "Dr. Priya" } },
      ]),
      mockPayments(),
      mockBookings(),
    );

    render(<PatientDashboard />);
    await waitFor(() => {
      expect(screen.getByText("with Dr. Priya")).toBeInTheDocument();
    });
  });

  it("shows Pay button for unpaid sessions", async () => {
    setupFetchChain(
      mockAuth(),
      mockSessions([
        { id: "s1", date: "2026-10-01T10:00:00Z", type: "individual", status: "scheduled", clinician: { id: "c1", name: "Dr. Priya" } },
      ]),
      mockPayments(),
      mockBookings(),
    );

    render(<PatientDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Pay ₹500")).toBeInTheDocument();
    });
  });

  it("hides Pay button for paid sessions", async () => {
    setupFetchChain(
      mockAuth(),
      mockSessions([
        { id: "s1", date: "2026-10-01T10:00:00Z", type: "individual", status: "scheduled", clinician: { id: "c1", name: "Dr. Priya" } },
      ]),
      mockPayments([
        { id: "p1", amount: 50000, status: "captured", createdAt: "2026-09-28T10:00:00Z", session: { id: "s1", date: "2026-10-01T10:00:00Z", type: "individual" } },
      ]),
      mockBookings(),
    );

    render(<PatientDashboard />);
    await waitFor(() => {
      expect(screen.queryByText("Pay ₹500")).not.toBeInTheDocument();
    });
  });

  it("shows payment history", async () => {
    setupFetchChain(
      mockAuth(),
      mockSessions(),
      mockPayments([
        { id: "p1", amount: 50000, status: "captured", createdAt: "2026-09-01T12:00:00Z", session: { id: "s1", date: "2026-09-01T10:00:00Z", type: "individual" } },
      ]),
      mockBookings(),
    );

    render(<PatientDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Payment History")).toBeInTheDocument();
      expect(screen.getAllByText("₹500").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows empty payment history", async () => {
    setupFetchChain(mockAuth(), mockSessions(), mockPayments(), mockBookings());

    render(<PatientDashboard />);
    await waitFor(() => {
      expect(screen.getByText("No payments yet.")).toBeInTheDocument();
    });
  });

  it("logout calls API and redirects", async () => {
    setupFetchChain(mockAuth(), mockSessions(), mockPayments(), mockBookings());
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) } as Response);

    render(<PatientDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Sign Out"));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("Messages link navigates to /messages", async () => {
    setupFetchChain(mockAuth(), mockSessions(), mockPayments(), mockBookings());

    render(<PatientDashboard />);
    await waitFor(() => {
      const msgLink = screen.getByText("Messages").closest("a");
      expect(msgLink).toHaveAttribute("href", "/messages");
    });
  });

  it("shows empty upcoming sessions with link to /book", async () => {
    setupFetchChain(mockAuth(), mockSessions(), mockPayments(), mockBookings());

    render(<PatientDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/No upcoming sessions/)).toBeInTheDocument();
    });
  });

  it("shows payment not configured message with placeholder key", async () => {
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = "your-razorpay-key-id";
    setupFetchChain(
      mockAuth(),
      mockSessions([
        { id: "s1", date: "2026-10-01T10:00:00Z", type: "individual", status: "scheduled", clinician: { id: "c1", name: "Dr. Priya" } },
      ]),
      mockPayments(),
      mockBookings(),
    );

    render(<PatientDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Pay ₹500")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Pay ₹500"));
    await waitFor(() => {
      expect(screen.getByText(/not yet configured/)).toBeInTheDocument();
    });
  });

  it("renders My Dashboard heading", async () => {
    setupFetchChain(mockAuth(), mockSessions(), mockPayments(), mockBookings());

    render(<PatientDashboard />);
    await waitFor(() => {
      expect(screen.getByText("My Dashboard")).toBeInTheDocument();
    });
  });
});
