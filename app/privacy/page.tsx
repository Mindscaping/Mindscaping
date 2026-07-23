import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Mindscaping privacy policy — how we handle your personal data in compliance with DPDP Act 2023.",
};

// ponytail: static page; Sanity page schema can replace this if content needs editing
export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-24 max-w-3xl mx-auto px-6">
      <h1 className="font-serif text-4xl font-light text-brand-brown mb-8">Privacy Policy</h1>

      <div className="space-y-6 text-sm leading-relaxed text-brand-brown/80">
        <p>
          <strong>Mindscaping</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting your privacy. This policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
        </p>

        <h2 className="font-serif text-xl font-medium text-brand-brown">1. Information We Collect</h2>
        <p>
          We collect personal information you voluntarily provide when you contact us via WhatsApp, phone, or email: your name, phone number, email address, and any health-related information you choose to share.
        </p>

        <h2 className="font-serif text-xl font-medium text-brand-brown">2. How We Use Your Information</h2>
        <p>
          We use your information solely to: respond to your enquiries, schedule appointments, provide therapy services, and communicate with you about your care.
        </p>

        <h2 className="font-serif text-xl font-medium text-brand-brown">3. Data Protection</h2>
        <p>
          We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. All communications are confidential.
        </p>

        <h2 className="font-serif text-xl font-medium text-brand-brown">4. Data Retention</h2>
        <p>
          We retain your personal data only as long as necessary to provide services and comply with legal obligations. When the purpose is fulfilled, data is securely erased.
        </p>

        <h2 className="font-serif text-xl font-medium text-brand-brown">5. Your Rights</h2>
        <p>
          Under the Digital Personal Data Protection Act 2023 (DPDP Act), you have the right to: access your data, correct inaccuracies, withdraw consent, request erasure, and file a grievance. To exercise these rights, contact us.
        </p>

        <h2 className="font-serif text-xl font-medium text-brand-brown">6. Grievance Officer</h2>
        <p>
          If you have any concerns regarding your data, please contact our Grievance Officer:<br />
          <strong>Anoushka Gupta</strong><br />
          Email: <a href="mailto:grievance@mindscaping.in" className="underline text-brand-brown">grievance@mindscaping.in</a><br />
          Phone: +91-8879997299
        </p>

        <h2 className="font-serif text-xl font-medium text-brand-brown">7. Updates</h2>
        <p>
          We may update this policy from time to time. The latest version will always be available on this page.
        </p>

        <p className="text-xs text-brand-taupe pt-4">Last updated: July 2026</p>
      </div>
    </div>
  );
}
