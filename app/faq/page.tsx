import type { Metadata } from "next";
import FaqSection from "@/components/sections/FaqSection";
import { getFaqs } from "@/lib/content";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Frequently asked questions about therapy at Mindscaping.",
};

export default async function FaqPage() {
  const faqs = await getFaqs();
  return <div className="pt-24"><FaqSection faqs={faqs} /></div>;
}
