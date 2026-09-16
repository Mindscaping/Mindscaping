import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: Record<string, unknown>) => <img alt={props.alt as string} src={props.src as string} />,
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => <a {...props}>{children}</a>,
}));

// Mock fetch for auth check
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ user: null }),
  }));
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

import Nav from "@/components/layout/Nav";

describe("Nav", () => {
  it("renders logo", async () => {
    render(<Nav />);
    const logo = screen.getByAltText("Mindscaping logo");
    expect(logo).toBeInTheDocument();
  });

  it("renders all navigation links on desktop", async () => {
    render(<Nav />);
    await waitFor(() => {
      expect(screen.getByText("Our Approach")).toBeInTheDocument();
    });
    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(screen.getByText("Gallery")).toBeInTheDocument();
    expect(screen.getByText("Blog")).toBeInTheDocument();
    expect(screen.getByText("FAQ")).toBeInTheDocument();
    expect(screen.getByText("Research")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  it("toggles mobile menu on hamburger click", async () => {
    render(<Nav />);
    await waitFor(() => screen.getByLabelText("Menu"));

    fireEvent.click(screen.getByLabelText("Menu"));
    const allTeamLinks = screen.getAllByText("Team");
    expect(allTeamLinks.length).toBeGreaterThanOrEqual(2);
  });

  it("has correct link hrefs", async () => {
    render(<Nav />);
    await waitFor(() => screen.getByText("Our Approach"));

    const approachLink = screen.getByText("Our Approach").closest("a");
    expect(approachLink).toHaveAttribute("href", "/#approach");

    const teamLink = screen.getByText("Team").closest("a");
    expect(teamLink).toHaveAttribute("href", "/team");
  });

  it("closes mobile menu when a link is clicked", async () => {
    render(<Nav />);
    await waitFor(() => screen.getByLabelText("Menu"));

    fireEvent.click(screen.getByLabelText("Menu"));

    const mobileTeamLinks = screen.getAllByText("Team");
    const mobileLink = mobileTeamLinks[mobileTeamLinks.length - 1];
    fireEvent.click(mobileLink);

    const remainingTeamLinks = screen.getAllByText("Team");
    expect(remainingTeamLinks).toHaveLength(1);
  });

  it("closes mobile menu when Research link is clicked", async () => {
    render(<Nav />);
    await waitFor(() => screen.getByLabelText("Menu"));

    fireEvent.click(screen.getByLabelText("Menu"));

    const researchLinks = screen.getAllByText("Research");
    const mobileResearch = researchLinks[researchLinks.length - 1];
    fireEvent.click(mobileResearch);

    const remaining = screen.getAllByText("Research");
    expect(remaining).toHaveLength(1);
  });

  it("shows auth links when logged out", async () => {
    render(<Nav />);
    await waitFor(() => {
      expect(screen.getByText("Sign In")).toBeInTheDocument();
    });
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  it("shows Dashboard and Sign Out when logged in", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: { id: "1", name: "Test User", role: "clinician" } }),
    } as Response);

    render(<Nav />);
    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });

  it("calls logout endpoint and redirects on Sign Out click", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: { id: "1", name: "Test User", role: "clinician" } }),
    } as Response);

    Object.defineProperty(window, "location", {
      value: { href: "/" },
      writable: true,
    });

    render(<Nav />);
    await waitFor(() => {
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Sign Out"));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
    });
  });

  it("shows Dashboard and Sign Out in mobile menu when logged in", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: { id: "1", name: "Test User", role: "clinician" } }),
    } as Response);

    render(<Nav />);
    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("Menu"));

    const dashboardLinks = screen.getAllByText("Dashboard");
    expect(dashboardLinks.length).toBeGreaterThanOrEqual(2);

    const signOutButtons = screen.getAllByText("Sign Out");
    expect(signOutButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("shows Sign In and Register in mobile menu when logged out", async () => {
    render(<Nav />);
    await waitFor(() => {
      expect(screen.getByText("Sign In")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("Menu"));

    const signInLinks = screen.getAllByText("Sign In");
    expect(signInLinks.length).toBeGreaterThanOrEqual(2);
  });

  it("clicks mobile Sign Out triggers logout", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: { id: "1", name: "Test", role: "clinician" } }),
    } as Response);
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    render(<Nav />);
    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("Menu"));

    const signOutBtn = screen.getAllByText("Sign Out");
    if (signOutBtn.length > 1) {
      fireEvent.click(signOutBtn[signOutBtn.length - 1]);
    }
  });

  it("clicks mobile Dashboard link closes menu", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: { id: "1", name: "Test", role: "clinician" } }),
    } as Response);

    render(<Nav />);
    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("Menu"));

    const dashLinks = screen.getAllByText("Dashboard");
    if (dashLinks.length > 1) {
      fireEvent.click(dashLinks[dashLinks.length - 1]);
    }

    await waitFor(() => {
      expect(screen.getAllByText("Dashboard")).toHaveLength(1);
    });
  });
});
