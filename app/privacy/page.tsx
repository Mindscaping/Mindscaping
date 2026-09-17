import type { Metadata } from "next";
import { getPrivacyContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Mindscaping privacy policy — how we handle your personal data in compliance with DPDP Act 2023.",
};

const defaultSections: { title: string; content: string }[] = [
  { title: "Information We Collect", content: "We collect personal information you voluntarily provide when you contact us via WhatsApp, phone, or email: your name, phone number, email address, and any health-related information you choose to share." },
  { title: "How We Use Your Information", content: "We use your information solely to: respond to your enquiries, schedule appointments, provide therapy services, and communicate with you about your care." },
  { title: "Data Protection", content: "We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. All communications are confidential." },
  { title: "Data Retention", content: "We retain your personal data only as long as necessary to provide services and comply with legal obligations. When the purpose is fulfilled, data is securely erased." },
  { title: "Your Rights", content: "Under the Digital Personal Data Protection Act 2023 (DPDP Act), you have the right to: access your data, correct inaccuracies, withdraw consent, request erasure, and file a grievance. To exercise these rights, contact us." },
  { title: "Grievance Officer", content: "If you have any concerns regarding your data, please contact our Grievance Officer:\nAnoushka Gupta\nEmail: hello@mindscaping.in\nPhone: +91-8879997299" },
  { title: "Updates", content: "We may update this policy from time to time. The latest version will always be available on this page." },
];

export default async function PrivacyPage() {
  const privacy = await getPrivacyContent();
  const sections: { title: string; content: string }[] = privacy?.sections || defaultSections;

  return (
    <div className="pt-32 pb-24 max-w-3xl mx-auto px-6">
      <h1 className="font-serif text-4xl font-light text-brand-brown mb-8">{privacy?.heading || "Privacy Policy"}</h1>

      <div className="space-y-6 text-sm leading-relaxed text-brand-brown/80">
        <p>
          <strong>Mindscaping</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting your privacy. This policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
        </p>

        {sections.map((s, i) => (
          <div key={i}>
            <h2 className="font-serif text-xl font-medium text-brand-brown">{`${i + 1}. ${s.title}`}</h2>
            <p className="whitespace-pre-line">{s.content}</p>
          </div>
        ))}

        <p className="text-xs text-brand-taupe pt-4">Last updated: {privacy?.lastUpdated || "July 2026"}</p>
      </div>
    </div>
  );
}
