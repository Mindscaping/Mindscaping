import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    booking: {
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "booking-1", ...data, createdAt: new Date() })),
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

import {
  getAvailableSlots,
  validateBooking,
  generateBookingId,
  saveBooking,
  getBookings,
  SESSION_TYPES,
  WEEKDAY_SLOTS,
  WEEKEND_SLOTS,
  type BookingFormData,
} from "@/lib/booking";

function validBooking(): BookingFormData {
  return {
    name: "Test User",
    email: "test@example.com",
    phone: "9876543210",
    sessionType: "individual",
    preferredDate: "2026-12-01",
    preferredTime: "10:00",
    therapistPreference: "No preference",
    notes: "",
  };
}

describe("getAvailableSlots", () => {
  it("returns weekday slots for Monday", () => {
    const slots = getAvailableSlots("2026-09-14");
    expect(slots).toEqual([...WEEKDAY_SLOTS]);
  });

  it("returns weekday slots for Friday", () => {
    const slots = getAvailableSlots("2026-09-18");
    expect(slots).toEqual([...WEEKDAY_SLOTS]);
  });

  it("returns weekend slots for Saturday", () => {
    const slots = getAvailableSlots("2026-09-12");
    expect(slots).toEqual([...WEEKEND_SLOTS]);
  });

  it("returns empty array for Sunday", () => {
    const slots = getAvailableSlots("2026-09-13");
    expect(slots).toEqual([]);
  });
});

describe("validateBooking", () => {
  it("returns no errors for valid booking", () => {
    const errors = validateBooking(validBooking());
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("requires name", () => {
    const errors = validateBooking({ ...validBooking(), name: "" });
    expect(errors.name).toBe("Name is required");
  });

  it("requires email", () => {
    const errors = validateBooking({ ...validBooking(), email: "" });
    expect(errors.email).toBe("Email is required");
  });

  it("validates email format", () => {
    const errors = validateBooking({ ...validBooking(), email: "notanemail" });
    expect(errors.email).toBe("Please enter a valid email");
  });

  it("requires phone", () => {
    const errors = validateBooking({ ...validBooking(), phone: "" });
    expect(errors.phone).toBe("Phone number is required");
  });

  it("validates phone format - too short", () => {
    const errors = validateBooking({ ...validBooking(), phone: "12345" });
    expect(errors.phone).toBe("Please enter a valid 10-digit Indian mobile number");
  });

  it("validates phone format - doesn't start with 6-9", () => {
    const errors = validateBooking({ ...validBooking(), phone: "1234567890" });
    expect(errors.phone).toBe("Please enter a valid 10-digit Indian mobile number");
  });

  it("accepts valid phone starting with 6", () => {
    const errors = validateBooking({ ...validBooking(), phone: "6234567890" });
    expect(errors.phone).toBeUndefined();
  });

  it("accepts phone with spaces", () => {
    const errors = validateBooking({ ...validBooking(), phone: "98765 43210" });
    expect(errors.phone).toBeUndefined();
  });

  it("requires session type", () => {
    const errors = validateBooking({ ...validBooking(), sessionType: "" as BookingFormData["sessionType"] });
    expect(errors.sessionType).toBe("Please select a session type");
  });

  it("requires preferred date", () => {
    const errors = validateBooking({ ...validBooking(), preferredDate: "" });
    expect(errors.preferredDate).toBe("Please select a date");
  });

  it("rejects past date", () => {
    const errors = validateBooking({ ...validBooking(), preferredDate: "2020-01-01" });
    expect(errors.preferredDate).toBe("Please select a future date");
  });

  it("requires preferred time", () => {
    const errors = validateBooking({ ...validBooking(), preferredTime: "" });
    expect(errors.preferredTime).toBe("Please select a time slot");
  });

  it("returns multiple errors for empty form", () => {
    const empty: BookingFormData = {
      name: "",
      email: "",
      phone: "",
      sessionType: "" as BookingFormData["sessionType"],
      preferredDate: "",
      preferredTime: "",
      therapistPreference: "",
      notes: "",
    };
    const errors = validateBooking(empty);
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(5);
  });
});

describe("generateBookingId", () => {
  it("starts with BK-", () => {
    const id = generateBookingId();
    expect(id).toMatch(/^BK-/);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateBookingId()));
    expect(ids.size).toBe(100);
  });
});

describe("saveBooking and getBookings", () => {
  it("saves a booking and retrieves it", async () => {
    const booking = await saveBooking(validBooking());
    expect(booking.id).toBe("booking-1");
    expect(booking.name).toBe("Test User");
  });

  it("getBookings returns array", async () => {
    const all = await getBookings();
    expect(Array.isArray(all)).toBe(true);
  });
});

describe("SESSION_TYPES", () => {
  it("has 6 session types", () => {
    expect(SESSION_TYPES).toHaveLength(6);
  });

  it("each has value and label", () => {
    SESSION_TYPES.forEach((st) => {
      expect(st.value).toBeTruthy();
      expect(st.label).toBeTruthy();
    });
  });
});
