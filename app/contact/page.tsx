import type { Metadata } from "next";
import ContactSection from "@/components/sections/ContactSection";
import { getContactContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Mindscaping. WhatsApp, phone, and session hours.",
};

export default async function ContactPage() {
  const contactContent = await getContactContent();

  return (
    <div className="pt-24">
      <ContactSection content={contactContent} />
    </div>
  );
}
