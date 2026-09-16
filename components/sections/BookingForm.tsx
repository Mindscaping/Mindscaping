"use client";

import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import {
  SESSION_TYPES,
  getAvailableSlots,
  validateBooking,
  type BookingFormData,
  type SessionType,
  type ValidationErrors,
} from "@/lib/booking";

const THERAPIST_OPTIONS = [
  "No preference",
  "Ms. Anoushka Gupta",
  "Mrs. Yashaswini Bansal",
  "Ms. Pavithra Chinnaiyan",
  "Ms. Alisha Sansare",
  "Mr. Harsh Mehta",
  "Dr. Aanushka Suklabaidya",
  "Ms. Shifa Sajan",
];

const initialForm: BookingFormData = {
  name: "",
  email: "",
  phone: "",
  sessionType: "" as SessionType,
  preferredDate: "",
  preferredTime: "",
  therapistPreference: "No preference",
  notes: "",
};

export default function BookingForm() {
  const ref = useReveal();
  const [form, setForm] = useState<BookingFormData>(initialForm);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const slots = form.preferredDate ? getAvailableSlots(form.preferredDate) : [];

  function update<K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const validationErrors = validateBooking(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to submit booking");
      setSubmitted(true);
    } catch {
      setServerError("Something went wrong. Please try again or contact us on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="bg-brand-cream py-24" ref={ref}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="reveal bg-brand-brown rounded-2xl p-10 sm:p-14 text-brand-offwhite">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
              ✓
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-light italic mb-4">
              Booking Request Received
            </h2>
            <p className="text-sm leading-relaxed opacity-75 mb-2">
              Thank you, {form.name}. We&apos;ve received your booking request for{" "}
              {SESSION_TYPES.find((s) => s.value === form.sessionType)?.label}.
            </p>
            <p className="text-sm leading-relaxed opacity-75 mb-6">
              Our team will review your request and confirm your session via WhatsApp or email within 24 hours.
            </p>
            <p className="text-xs opacity-50">
              For urgent queries, WhatsApp us at +91-8879997299.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const inputBase =
    "w-full bg-white border border-brand-brown/15 rounded-xl px-4 py-3 text-sm text-brand-brown placeholder:text-brand-brown/40 focus:outline-none focus:ring-2 focus:ring-brand-taupe/40 focus:border-brand-taupe transition-colors";
  const labelBase = "block text-xs tracking-wide uppercase text-brand-brown/70 mb-1.5";
  const errorBase = "text-xs text-red-500 mt-1";

  return (
    <section className="bg-brand-cream py-24" ref={ref}>
      <div className="max-w-3xl mx-auto px-6">
        <p className="reveal text-xs tracking-[0.2em] uppercase text-brand-taupe mb-4">
          Book a Session
        </p>
        <h2 className="reveal font-serif text-[clamp(2.2rem,4vw,3.4rem)] font-light leading-tight text-brand-brown">
          Begin your <em className="italic text-brand-taupe">healing journey.</em>
        </h2>
        <p className="reveal mt-4 text-[0.98rem] leading-relaxed text-brand-brown/80 font-light max-w-xl">
          Fill in the form below and we&apos;ll get back to you within 24 hours to confirm your session.
        </p>

        <form onSubmit={handleSubmit} className="reveal mt-10 space-y-6" noValidate>
          <div>
            <label htmlFor="booking-name" className={labelBase}>
              Full Name *
            </label>
            <input
              id="booking-name"
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputBase}
              placeholder="Your full name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "error-name" : undefined}
            />
            {errors.name && (
              <p id="error-name" className={errorBase} role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="booking-email" className={labelBase}>
                Email *
              </label>
              <input
                id="booking-email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputBase}
                placeholder="your.email@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "error-email" : undefined}
              />
              {errors.email && (
                <p id="error-email" className={errorBase} role="alert">
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="booking-phone" className={labelBase}>
                Phone Number *
              </label>
              <input
                id="booking-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={inputBase}
                placeholder="98765 43210"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "error-phone" : undefined}
              />
              {errors.phone && (
                <p id="error-phone" className={errorBase} role="alert">
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="booking-session" className={labelBase}>
              Session Type *
            </label>
            <select
              id="booking-session"
              value={form.sessionType}
              onChange={(e) => update("sessionType", e.target.value as SessionType)}
              className={inputBase}
              aria-invalid={!!errors.sessionType}
              aria-describedby={errors.sessionType ? "error-session" : undefined}
            >
              <option value="">Select a session type</option>
              {SESSION_TYPES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
            {errors.sessionType && (
              <p id="error-session" className={errorBase} role="alert">
                {errors.sessionType}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="booking-date" className={labelBase}>
                Preferred Date *
              </label>
              <input
                id="booking-date"
                type="date"
                value={form.preferredDate}
                onChange={(e) => {
                  update("preferredDate", e.target.value);
                  update("preferredTime", "");
                }}
                min={new Date().toISOString().split("T")[0]}
                className={inputBase}
                aria-invalid={!!errors.preferredDate}
                aria-describedby={errors.preferredDate ? "error-date" : undefined}
              />
              {errors.preferredDate && (
                <p id="error-date" className={errorBase} role="alert">
                  {errors.preferredDate}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="booking-time" className={labelBase}>
                Preferred Time *
              </label>
              <select
                id="booking-time"
                value={form.preferredTime}
                onChange={(e) => update("preferredTime", e.target.value)}
                className={inputBase}
                disabled={!form.preferredDate || slots.length === 0}
                aria-invalid={!!errors.preferredTime}
                aria-describedby={errors.preferredTime ? "error-time" : undefined}
              >
                <option value="">
                  {form.preferredDate && slots.length === 0
                    ? "No slots available (Sunday)"
                    : form.preferredDate
                      ? "Select a time"
                      : "Select a date first"}
                </option>
                {slots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              {errors.preferredTime && (
                <p id="error-time" className={errorBase} role="alert">
                  {errors.preferredTime}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="booking-therapist" className={labelBase}>
              Therapist Preference
            </label>
            <select
              id="booking-therapist"
              value={form.therapistPreference}
              onChange={(e) => update("therapistPreference", e.target.value)}
              className={inputBase}
            >
              {THERAPIST_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="booking-notes" className={labelBase}>
              Additional Notes
            </label>
            <textarea
              id="booking-notes"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
              className={inputBase}
              placeholder="Anything you'd like us to know before your session..."
            />
          </div>

          {serverError && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl" role="alert">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto bg-brand-brown text-brand-offwhite px-10 py-3.5 rounded-full text-xs tracking-widest uppercase font-medium hover:bg-brand-taupe disabled:opacity-50 transition-colors"
          >
            {submitting ? "Submitting..." : "Request Booking"}
          </button>
        </form>
      </div>
    </section>
  );
}
