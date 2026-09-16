import { prisma } from "./db";

export type SessionType =
  | "individual"
  | "couples"
  | "family"
  | "group"
  | "corporate"
  | "school";

export const SESSION_TYPES: { value: SessionType; label: string }[] = [
  { value: "individual", label: "Individual Therapy" },
  { value: "couples", label: "Couples Therapy" },
  { value: "family", label: "Family Therapy" },
  { value: "group", label: "Group Therapy" },
  { value: "corporate", label: "Corporate Wellness" },
  { value: "school", label: "School Programme" },
];

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  sessionType: SessionType;
  preferredDate: string;
  preferredTime: string;
  therapistPreference: string;
  notes: string;
}

export const WEEKDAY_SLOTS = [
  "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
] as const;

export const WEEKEND_SLOTS = ["10:00", "11:00", "12:00", "14:00", "15:00"] as const;

export function getAvailableSlots(dateStr: string): readonly string[] {
  const date = new Date(dateStr + "T00:00:00");
  const day = date.getDay();
  if (day === 0) return [];
  if (day === 6) return WEEKEND_SLOTS;
  return WEEKDAY_SLOTS;
}

export type ValidationErrors = { [key: string]: string | undefined };

export function validateBooking(data: BookingFormData): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!data.name.trim()) errors.name = "Name is required";
  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email";
  }
  if (!data.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^[6-9]\d{9}$/.test(data.phone.replace(/\s/g, ""))) {
    errors.phone = "Please enter a valid 10-digit Indian mobile number";
  }
  if (!data.sessionType) errors.sessionType = "Please select a session type";
  if (!data.preferredDate) {
    errors.preferredDate = "Please select a date";
  } else {
    const selected = new Date(data.preferredDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) errors.preferredDate = "Please select a future date";
  }
  if (!data.preferredTime) errors.preferredTime = "Please select a time slot";
  return errors;
}

export function generateBookingId(): string {
  return `BK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function saveBooking(data: BookingFormData) {
  const booking = await prisma.booking.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      sessionType: data.sessionType,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      therapistPreference: data.therapistPreference,
      notes: data.notes,
    },
  });
  return booking;
}

export async function getBookings() {
  return prisma.booking.findMany({ orderBy: { createdAt: "desc" } });
}
