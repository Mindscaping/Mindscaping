import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

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

function mockAuth(user = { id: "u1", name: "Dr. Priya", role: "clinician" }) {
  return { ok: true, json: () => Promise.resolve({ user }) } as Response;
}

function mockPatients(patients: unknown[] = []) {
  return { ok: true, json: () => Promise.resolve({ patients }) } as Response;
}

function mockSessions(sessions: unknown[] = []) {
  return { ok: true, json: () => Promise.resolve({ sessions }) } as Response;
}

function mockNotes(notes: unknown[] = []) {
  return { ok: true, json: () => Promise.resolve({ notes }) } as Response;
}

function mockBookings(bookings: unknown[] = []) {
  return { ok: true, json: () => Promise.resolve({ bookings }) } as Response;
}

function setupFetchChain(
  authResp: Response,
  patientsResp: Response,
  sessionsResp: Response,
  notesResp: Response,
  bookingsResp: Response,
) {
  vi.mocked(fetch)
    .mockResolvedValueOnce(authResp)
    .mockResolvedValueOnce(patientsResp)
    .mockResolvedValueOnce(sessionsResp)
    .mockResolvedValueOnce(notesResp)
    .mockResolvedValueOnce(bookingsResp);
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockAuth()));
});

afterEach(() => {
  vi.restoreAllMocks();
});

import ClinicianDashboard from "@/app/dashboard/clinician/page";

describe("ClinicianDashboard", () => {
  it("redirects to /login when not authenticated", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: null }),
    } as Response);

    render(<ClinicianDashboard />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("redirects to /login for non-clinician role", async () => {
    vi.mocked(fetch).mockResolvedValue(mockAuth({ id: "u1", name: "Rahul", role: "patient" }));

    render(<ClinicianDashboard />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("redirects to /login on fetch error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("fail"));

    render(<ClinicianDashboard />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("renders nothing while no user", async () => {
    let resolveAuth!: (v: Response) => void;
    vi.mocked(fetch).mockImplementationOnce(
      () => new Promise((r) => { resolveAuth = r; }),
    );

    const { container } = render(<ClinicianDashboard />);
    expect(container.innerHTML).toBe("");
    resolveAuth(mockAuth());
    await waitFor(() => {});
  });

  it("shows welcome message", async () => {
    setupFetchChain(mockAuth(), mockPatients(), mockSessions(), mockNotes(), mockBookings());

    render(<ClinicianDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Dr. Priya/)).toBeInTheDocument();
    });
  });

  it("renders all 5 tab buttons", async () => {
    setupFetchChain(mockAuth(), mockPatients(), mockSessions(), mockNotes(), mockBookings());

    render(<ClinicianDashboard />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Bookings" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Patients" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sessions" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Notes" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Messages" })).toBeInTheDocument();
    });
  });

  it("defaults to Bookings tab", async () => {
    setupFetchChain(mockAuth(), mockPatients(), mockSessions(), mockNotes(), mockBookings());

    render(<ClinicianDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Booking Requests")).toBeInTheDocument();
    });
  });

  it("switches tabs on click", async () => {
    setupFetchChain(
      mockAuth(),
      mockPatients([{ id: "p1", name: "Rahul", email: "rahul@test.com", phone: "9876543210", createdAt: "2026-01-01" }]),
      mockSessions(),
      mockNotes(),
      mockBookings(),
    );

    render(<ClinicianDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Booking Requests")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Patients" }));
    await waitFor(() => {
      expect(screen.getByText("Your Patients")).toBeInTheDocument();
    });
  });

  it("Bookings tab: shows empty state", async () => {
    setupFetchChain(mockAuth(), mockPatients(), mockSessions(), mockNotes(), mockBookings());

    render(<ClinicianDashboard />);
    await waitFor(() => {
      expect(screen.getByText("No booking requests yet.")).toBeInTheDocument();
    });
  });

  it("Bookings tab: lists pending bookings with Accept/Decline", async () => {
    setupFetchChain(
      mockAuth(),
      mockPatients(),
      mockSessions(),
      mockNotes(),
      mockBookings([
        {
          id: "b1", name: "Rahul", email: "rahul@test.com", phone: "9876543210",
          sessionType: "individual", preferredDate: "2026-10-01", preferredTime: "10:00",
          therapistPreference: "No preference", notes: null, status: "pending", createdAt: "2026-09-28T10:00:00Z",
        },
      ]),
    );

    render(<ClinicianDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Rahul")).toBeInTheDocument();
      expect(screen.getByText("Accept")).toBeInTheDocument();
      expect(screen.getByText("Decline")).toBeInTheDocument();
    });
  });

  it("Bookings tab: hides Accept/Decline for confirmed bookings", async () => {
    setupFetchChain(
      mockAuth(),
      mockPatients(),
      mockSessions(),
      mockNotes(),
      mockBookings([
        {
          id: "b1", name: "Rahul", email: "rahul@test.com", phone: "9876543210",
          sessionType: "individual", preferredDate: "2026-10-01", preferredTime: "10:00",
          therapistPreference: "No preference", notes: null, status: "confirmed", createdAt: "2026-09-28T10:00:00Z",
        },
      ]),
    );

    render(<ClinicianDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Rahul")).toBeInTheDocument();
      expect(screen.queryByText("Accept")).not.toBeInTheDocument();
      expect(screen.queryByText("Decline")).not.toBeInTheDocument();
    });
  });

  it("Bookings tab: Accept confirms booking and creates session", async () => {
    setupFetchChain(
      mockAuth(),
      mockPatients([{ id: "p1", name: "Rahul", email: "rahul@test.com" }]),
      mockSessions(),
      mockNotes(),
      mockBookings([
        {
          id: "b1", name: "Rahul", email: "rahul@test.com", phone: "9876543210",
          sessionType: "individual", preferredDate: "2026-10-01", preferredTime: "10:00",
          therapistPreference: "No preference", notes: null, status: "pending", createdAt: "2026-09-28T10:00:00Z",
        },
      ]),
    );

    render(<ClinicianDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Accept")).toBeInTheDocument();
    });

    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve({}) } as Response);
    fireEvent.click(screen.getByText("Accept"));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/bookings",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ id: "b1", status: "confirmed" }),
        }),
      );
    });
  });

  it("Bookings tab: Decline cancels booking", async () => {
    setupFetchChain(
      mockAuth(),
      mockPatients(),
      mockSessions(),
      mockNotes(),
      mockBookings([
        {
          id: "b1", name: "Rahul", email: "rahul@test.com", phone: "9876543210",
          sessionType: "individual", preferredDate: "2026-10-01", preferredTime: "10:00",
          therapistPreference: "No preference", notes: null, status: "pending", createdAt: "2026-09-28T10:00:00Z",
        },
      ]),
    );

    render(<ClinicianDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Decline")).toBeInTheDocument();
    });

    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve({}) } as Response);
    fireEvent.click(screen.getByText("Decline"));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/bookings",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ id: "b1", status: "cancelled" }),
        }),
      );
    });
  });

  it("Patients tab: lists patients", async () => {
    setupFetchChain(
      mockAuth(),
      mockPatients([
        { id: "p1", name: "Rahul", email: "rahul@test.com", phone: "9876543210", createdAt: "2026-01-01" },
      ]),
      mockSessions(),
      mockNotes(),
      mockBookings(),
    );

    render(<ClinicianDashboard />);
    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: "Patients" }));
    });
    await waitFor(() => {
      expect(screen.getByText("Rahul")).toBeInTheDocument();
    });
  });

  it("Patients tab: Message link to /messages?with=", async () => {
    setupFetchChain(
      mockAuth(),
      mockPatients([
        { id: "p1", name: "Rahul", email: "rahul@test.com", phone: "9876543210", createdAt: "2026-01-01" },
      ]),
      mockSessions(),
      mockNotes(),
      mockBookings(),
    );

    render(<ClinicianDashboard />);
    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: "Patients" }));
    });
    await waitFor(() => {
      const msgLink = screen.getByText("Message").closest("a");
      expect(msgLink).toHaveAttribute("href", "/messages?with=p1");
    });
  });

  it("Patients tab: empty state", async () => {
    setupFetchChain(mockAuth(), mockPatients(), mockSessions(), mockNotes(), mockBookings());

    render(<ClinicianDashboard />);
    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: "Patients" }));
    });
    await waitFor(() => {
      expect(screen.getByText("No patients registered yet.")).toBeInTheDocument();
    });
  });

  it("Sessions tab: schedule form renders", async () => {
    setupFetchChain(
      mockAuth(),
      mockPatients([{ id: "p1", name: "Rahul" }]),
      mockSessions(),
      mockNotes(),
      mockBookings(),
    );

    render(<ClinicianDashboard />);
    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: "Sessions" }));
    });
    await waitFor(() => {
      expect(screen.getByText("Schedule Session")).toBeInTheDocument();
    });
  });

  it("Sessions tab: lists sessions", async () => {
    setupFetchChain(
      mockAuth(),
      mockPatients(),
      mockSessions([
        { id: "s1", date: "2026-10-01T10:00:00Z", type: "individual", status: "scheduled", patient: { id: "p1", name: "Rahul", email: "r@t.com" } },
      ]),
      mockNotes(),
      mockBookings(),
    );

    render(<ClinicianDashboard />);
    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: "Sessions" }));
    });
    await waitFor(() => {
      expect(screen.getByText("Rahul")).toBeInTheDocument();
    });
  });

  it("Sessions tab: empty state", async () => {
    setupFetchChain(mockAuth(), mockPatients(), mockSessions(), mockNotes(), mockBookings());

    render(<ClinicianDashboard />);
    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: "Sessions" }));
    });
    await waitFor(() => {
      expect(screen.getByText("No sessions yet.")).toBeInTheDocument();
    });
  });

  it("Notes tab: create note form renders", async () => {
    setupFetchChain(
      mockAuth(),
      mockPatients([{ id: "p1", name: "Rahul" }]),
      mockSessions(),
      mockNotes(),
      mockBookings(),
    );

    render(<ClinicianDashboard />);
    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: "Notes" }));
    });
    await waitFor(() => {
      expect(screen.getByText("Add Note")).toBeInTheDocument();
    });
  });

  it("Notes tab: lists notes", async () => {
    setupFetchChain(
      mockAuth(),
      mockPatients(),
      mockSessions(),
      mockNotes([
        {
          id: "n1", type: "session", content: "Patient discussed anxiety", createdAt: "2026-09-01", updatedAt: "2026-09-01",
          patient: { id: "p1", name: "Rahul" }, session: { id: "s1", date: "2026-09-01T10:00:00Z", type: "individual" },
        },
      ]),
      mockBookings(),
    );

    render(<ClinicianDashboard />);
    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: "Notes" }));
    });
    await waitFor(() => {
      expect(screen.getByText("Patient discussed anxiety")).toBeInTheDocument();
    });
  });

  it("Notes tab: empty state", async () => {
    setupFetchChain(mockAuth(), mockPatients(), mockSessions(), mockNotes(), mockBookings());

    render(<ClinicianDashboard />);
    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: "Notes" }));
    });
    await waitFor(() => {
      expect(screen.getByText("No notes yet.")).toBeInTheDocument();
    });
  });

  it("Messages tab: patient list with links", async () => {
    setupFetchChain(
      mockAuth(),
      mockPatients([
        { id: "p1", name: "Rahul", email: "rahul@test.com", phone: "9876543210", createdAt: "2026-01-01" },
      ]),
      mockSessions(),
      mockNotes(),
      mockBookings(),
    );

    render(<ClinicianDashboard />);
    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: "Messages" }));
    });
    await waitFor(() => {
      const link = screen.getAllByText("Rahul").pop()?.closest("a");
      expect(link).toHaveAttribute("href", "/messages?with=p1");
    });
  });

  it("Logout calls API and redirects", async () => {
    setupFetchChain(mockAuth(), mockPatients(), mockSessions(), mockNotes(), mockBookings());
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) } as Response);

    render(<ClinicianDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Sign Out"));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("shows success message banner in green", async () => {
    setupFetchChain(
      mockAuth(),
      mockPatients([{ id: "p1", name: "Rahul", email: "r@t.com" }]),
      mockSessions(),
      mockNotes(),
      mockBookings([
        {
          id: "b1", name: "Rahul", email: "r@t.com", phone: "9876543210",
          sessionType: "individual", preferredDate: "2026-10-01", preferredTime: "10:00",
          therapistPreference: "No preference", notes: null, status: "pending", createdAt: "2026-09-28T10:00:00Z",
        },
      ]),
    );

    render(<ClinicianDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Accept")).toBeInTheDocument();
    });

    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve({}) } as Response);
    fireEvent.click(screen.getByText("Accept"));
    await waitFor(() => {
      const msg = screen.getByText(/Booking confirmed/);
      expect(msg.closest("div")).toHaveClass("bg-green-50");
    });
  });

  it("shows error message banner in red", async () => {
    setupFetchChain(
      mockAuth(),
      mockPatients([{ id: "p1", name: "Rahul", email: "r@t.com" }]),
      mockSessions(),
      mockNotes(),
      mockBookings([
        {
          id: "b1", name: "Rahul", email: "r@t.com", phone: "9876543210",
          sessionType: "individual", preferredDate: "2026-10-01", preferredTime: "10:00",
          therapistPreference: "No preference", notes: null, status: "pending", createdAt: "2026-09-28T10:00:00Z",
        },
      ]),
    );

    render(<ClinicianDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Decline")).toBeInTheDocument();
    });

    vi.mocked(fetch).mockResolvedValue({ ok: false, json: () => Promise.resolve({}) } as Response);
    fireEvent.click(screen.getByText("Decline"));
    await waitFor(() => {
      const msg = screen.getByText(/Failed to decline/);
      expect(msg.closest("div")).toHaveClass("bg-red-50");
    });
  });

  it("shows Clinician Dashboard heading", async () => {
    setupFetchChain(mockAuth(), mockPatients(), mockSessions(), mockNotes(), mockBookings());

    render(<ClinicianDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Clinician Dashboard")).toBeInTheDocument();
    });
  });

  it("Notes tab: shows session select when type is session", async () => {
    setupFetchChain(
      mockAuth(),
      mockPatients([{ id: "p1", name: "Rahul" }]),
      mockSessions([
        { id: "s1", date: "2026-10-01T10:00:00Z", type: "individual", status: "scheduled", patient: { id: "p1", name: "Rahul", email: "r@t.com" } },
      ]),
      mockNotes(),
      mockBookings(),
    );

    render(<ClinicianDashboard />);
    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: "Notes" }));
    });
    await waitFor(() => {
      expect(screen.getByText("Session (optional)")).toBeInTheDocument();
    });
  });

  it("Bookings tab: shows session type", async () => {
    setupFetchChain(
      mockAuth(),
      mockPatients(),
      mockSessions(),
      mockNotes(),
      mockBookings([
        {
          id: "b1", name: "Rahul", email: "rahul@test.com", phone: "9876543210",
          sessionType: "couples", preferredDate: "2026-10-01", preferredTime: "10:00",
          therapistPreference: "Dr. Priya", notes: "First session", status: "pending", createdAt: "2026-09-28T10:00:00Z",
        },
      ]),
    );

    render(<ClinicianDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Therapist: Dr. Priya")).toBeInTheDocument();
    });
  });

  it("Dashboard link navigates to /dashboard", async () => {
    setupFetchChain(mockAuth(), mockPatients(), mockSessions(), mockNotes(), mockBookings());

    render(<ClinicianDashboard />);
    await waitFor(() => {
      const dashLink = screen.getByText("Dashboard").closest("a");
      expect(dashLink).toHaveAttribute("href", "/dashboard");
    });
  });
});
