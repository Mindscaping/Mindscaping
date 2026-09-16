import type { Metadata } from "next";
import BookingForm from "@/components/sections/BookingForm";

export const metadata: Metadata = {
  title: "Book a Session",
  description:
    "Book a therapy session with Mindscaping. Individual, couples, family, and group therapy available in Mumbai.",
};

export default function BookPage() {
  return (
    <div className="pt-24">
      <BookingForm />
    </div>
  );
}
