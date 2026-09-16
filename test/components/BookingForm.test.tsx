import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img alt={props.alt as string} src={props.src as string} />,
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => <a {...props}>{children}</a>,
}));

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.restoreAllMocks();
});

import BookingForm from "@/components/sections/BookingForm";

describe("BookingForm", () => {
  it("renders the booking form heading", () => {
    render(<BookingForm />);
    expect(screen.getByText(/Begin your/)).toBeInTheDocument();
  });

  it("renders the form description", () => {
    render(<BookingForm />);
    expect(screen.getByText(/Fill in the form below/)).toBeInTheDocument();
  });

  it("renders all form fields", () => {
    render(<BookingForm />);
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Session Type/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Preferred Date/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Preferred Time/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Therapist Preference/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Additional Notes/)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<BookingForm />);
    expect(screen.getByRole("button", { name: /Request Booking/ })).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    render(<BookingForm />);
    fireEvent.click(screen.getByRole("button", { name: /Request Booking/ }));
    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Phone number is required")).toBeInTheDocument();
    expect(screen.getByText("Please select a session type")).toBeInTheDocument();
    expect(screen.getByText("Please select a date")).toBeInTheDocument();
    expect(screen.getByText("Please select a time slot")).toBeInTheDocument();
  });

  it("clears name error when user types", async () => {
    render(<BookingForm />);
    fireEvent.click(screen.getByRole("button", { name: /Request Booking/ }));
    expect(await screen.findByText("Name is required")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: "Test" } });
    expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
  });

  it("validates email format", async () => {
    render(<BookingForm />);
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "bad" } });
    fireEvent.click(screen.getByRole("button", { name: /Request Booking/ }));
    expect(await screen.findByText("Please enter a valid email")).toBeInTheDocument();
  });

  it("validates phone number", async () => {
    render(<BookingForm />);
    fireEvent.change(screen.getByLabelText(/Phone Number/), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: /Request Booking/ }));
    expect(await screen.findByText("Please enter a valid 10-digit Indian mobile number")).toBeInTheDocument();
  });

  it("shows time slots when date is selected", () => {
    render(<BookingForm />);
    fireEvent.change(screen.getByLabelText(/Preferred Date/), { target: { value: "2026-09-14" } });
    const timeSelect = screen.getByLabelText(/Preferred Time/) as HTMLSelectElement;
    expect(timeSelect.options.length).toBeGreaterThan(1);
  });

  it("shows no slots message on Sunday", () => {
    render(<BookingForm />);
    fireEvent.change(screen.getByLabelText(/Preferred Date/), { target: { value: "2026-09-13" } });
    const timeSelect = screen.getByLabelText(/Preferred Time/) as HTMLSelectElement;
    expect(timeSelect.options[0].text).toContain("No slots available");
  });

  it("disables time select when no date selected", () => {
    render(<BookingForm />);
    const timeSelect = screen.getByLabelText(/Preferred Time/) as HTMLSelectElement;
    expect(timeSelect.disabled).toBe(true);
  });

  it("resets time when date changes", () => {
    render(<BookingForm />);
    fireEvent.change(screen.getByLabelText(/Preferred Date/), { target: { value: "2026-09-14" } });
    fireEvent.change(screen.getByLabelText(/Preferred Time/), { target: { value: "10:00" } });
    fireEvent.change(screen.getByLabelText(/Preferred Date/), { target: { value: "2026-09-15" } });
    const timeSelect = screen.getByLabelText(/Preferred Time/) as HTMLSelectElement;
    expect(timeSelect.value).toBe("");
  });

  it("submits form successfully", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });

    render(<BookingForm />);
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: "Test User" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Phone Number/), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByLabelText(/Session Type/), { target: { value: "individual" } });
    fireEvent.change(screen.getByLabelText(/Preferred Date/), { target: { value: "2026-12-01" } });
    fireEvent.change(screen.getByLabelText(/Preferred Time/), { target: { value: "10:00" } });

    fireEvent.click(screen.getByRole("button", { name: /Request Booking/ }));

    await waitFor(() => {
      expect(screen.getByText(/Booking Request Received/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Thank you, Test User/)).toBeInTheDocument();
  });

  it("shows error on failed submit", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });

    render(<BookingForm />);
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: "Test User" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Phone Number/), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByLabelText(/Session Type/), { target: { value: "individual" } });
    fireEvent.change(screen.getByLabelText(/Preferred Date/), { target: { value: "2026-12-01" } });
    fireEvent.change(screen.getByLabelText(/Preferred Time/), { target: { value: "10:00" } });

    fireEvent.click(screen.getByRole("button", { name: /Request Booking/ }));

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    });
  });

  it("shows error on network failure", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    render(<BookingForm />);
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: "Test User" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Phone Number/), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByLabelText(/Session Type/), { target: { value: "individual" } });
    fireEvent.change(screen.getByLabelText(/Preferred Date/), { target: { value: "2026-12-01" } });
    fireEvent.change(screen.getByLabelText(/Preferred Time/), { target: { value: "10:00" } });

    fireEvent.click(screen.getByRole("button", { name: /Request Booking/ }));

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    });
  });

  it("shows loading state while submitting", async () => {
    let resolveFetch: (v: unknown) => void;
    globalThis.fetch = vi.fn().mockImplementation(
      () => new Promise((resolve) => { resolveFetch = resolve; }),
    );

    render(<BookingForm />);
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: "Test User" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Phone Number/), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByLabelText(/Session Type/), { target: { value: "individual" } });
    fireEvent.change(screen.getByLabelText(/Preferred Date/), { target: { value: "2026-12-01" } });
    fireEvent.change(screen.getByLabelText(/Preferred Time/), { target: { value: "10:00" } });

    fireEvent.click(screen.getByRole("button", { name: /Request Booking/ }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Submitting/ })).toBeDisabled();
    });

    resolveFetch!({ ok: true });
  });

  it("populates all session type options", () => {
    render(<BookingForm />);
    const select = screen.getByLabelText(/Session Type/) as HTMLSelectElement;
    expect(select.options.length).toBe(7); // 6 types + placeholder
  });

  it("populates therapist options", () => {
    render(<BookingForm />);
    const select = screen.getByLabelText(/Therapist Preference/) as HTMLSelectElement;
    expect(select.options.length).toBe(8);
  });

  it("pre-fills form from logged-in user data", async () => {
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ user: { name: "Logged User", email: "logged@test.com", phone: "9876543210" } }) })
      .mockResolvedValue({ ok: true });

    render(<BookingForm />);
    await waitFor(() => {
      expect(screen.getByLabelText(/Full Name/)).toHaveValue("Logged User");
    });
    expect(screen.getByLabelText(/Email/)).toHaveValue("logged@test.com");
    expect(screen.getByLabelText(/Phone Number/)).toHaveValue("9876543210");
  });

  it("resets form when Book Another is clicked", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });

    render(<BookingForm />);
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: "Test User" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByLabelText(/Phone Number/), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByLabelText(/Session Type/), { target: { value: "individual" } });
    fireEvent.change(screen.getByLabelText(/Preferred Date/), { target: { value: "2026-12-01" } });
    fireEvent.change(screen.getByLabelText(/Preferred Time/), { target: { value: "10:00" } });
    fireEvent.click(screen.getByRole("button", { name: /Request Booking/ }));

    await waitFor(() => {
      expect(screen.getByText(/Booking Request Received/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Book Another Session/));
    expect(screen.getByLabelText(/Full Name/)).toHaveValue("");
    expect(screen.getByLabelText(/Email/)).toHaveValue("");
  });

  it("has accessible form labels", () => {
    render(<BookingForm />);
    expect(screen.getByLabelText(/Full Name/)).toHaveAttribute("id", "booking-name");
    expect(screen.getByLabelText(/Email/)).toHaveAttribute("id", "booking-email");
    expect(screen.getByLabelText(/Phone Number/)).toHaveAttribute("id", "booking-phone");
    expect(screen.getByLabelText(/Session Type/)).toHaveAttribute("id", "booking-session");
    expect(screen.getByLabelText(/Preferred Date/)).toHaveAttribute("id", "booking-date");
    expect(screen.getByLabelText(/Preferred Time/)).toHaveAttribute("id", "booking-time");
    expect(screen.getByLabelText(/Therapist Preference/)).toHaveAttribute("id", "booking-therapist");
    expect(screen.getByLabelText(/Additional Notes/)).toHaveAttribute("id", "booking-notes");
  });

  it("sets aria-describedby for fields with errors", async () => {
    render(<BookingForm />);
    fireEvent.click(screen.getByRole("button", { name: /Request Booking/ }));
    await screen.findByText("Name is required");

    expect(screen.getByLabelText(/Full Name/)).toHaveAttribute("aria-describedby", "error-name");
    expect(screen.getByLabelText(/Full Name/)).toHaveAttribute("aria-invalid", "true");
  });

  it("can fill in notes field", () => {
    render(<BookingForm />);
    fireEvent.change(screen.getByLabelText(/Additional Notes/), {
      target: { value: "I have anxiety" },
    });
    expect(screen.getByLabelText(/Additional Notes/)).toHaveValue("I have anxiety");
  });

  it("can select different session types", () => {
    render(<BookingForm />);
    fireEvent.change(screen.getByLabelText(/Session Type/), { target: { value: "couples" } });
    expect(screen.getByLabelText(/Session Type/)).toHaveValue("couples");
  });

  it("can select therapist preference", () => {
    render(<BookingForm />);
    fireEvent.change(screen.getByLabelText(/Therapist Preference/), {
      target: { value: "Ms. Anoushka Gupta" },
    });
    expect(screen.getByLabelText(/Therapist Preference/)).toHaveValue("Ms. Anoushka Gupta");
  });
});
