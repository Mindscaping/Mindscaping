"use client";

import { useEffect, useRef } from "react";

export default function ContactSection() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("visible"), i * 60);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    el.querySelectorAll(".reveal").forEach((r) => observer.observe(r));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="contact" className="bg-brand-cream py-24" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <p className="reveal text-xs tracking-[0.2em] uppercase text-brand-taupe mb-4">Contact Us</p>
        <h2 className="reveal font-serif text-[clamp(2.2rem,4vw,3.4rem)] font-light leading-tight text-brand-brown">
          Our doors are <em className="italic text-brand-taupe">open.</em>
        </h2>

        <div className="reveal mt-14 grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-20">
          <div>
            <p className="text-[0.98rem] leading-relaxed text-brand-brown/80 font-light mb-8">
              In case of queries, don&apos;t hesitate to reach out. We are here to support your mental health journey in a comfortable and welcoming environment.
            </p>

            <div className="flex items-center gap-4 mb-5">
              <div className="w-11 h-11 bg-brand-brown rounded-full flex items-center justify-center text-lg flex-shrink-0">
                💬
              </div>
              <div>
                <strong className="block text-sm text-brand-brown">Contact Us</strong>
                <span className="text-sm text-brand-brown/80 font-light">+91-8879997299</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <div className="w-11 h-11 bg-brand-brown rounded-full flex items-center justify-center text-lg flex-shrink-0">
                🕐
              </div>
              <div>
                <strong className="block text-sm text-brand-brown">Enquiries</strong>
                <span className="text-sm text-brand-brown/80 font-light">Mon – Sat · 9:00 AM to 9:00 PM</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-brand-brown rounded-full flex items-center justify-center text-lg flex-shrink-0">
                🗓️
              </div>
              <div>
                <strong className="block text-sm text-brand-brown">Sessions</strong>
                <span className="text-sm text-brand-brown/80 font-light">Mon – Fri · 10:00 AM to 7:00 PM</span>
                <span className="block text-xs text-brand-brown/60 font-light mt-0.5">Weekend sessions subject to counselor availability</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-brown rounded-2xl p-8 sm:p-10 text-brand-offwhite">
            <p className="font-serif text-xl sm:text-2xl font-light italic mb-2">Ready to take the first step?</p>
            <p className="text-sm tracking-wide opacity-60 mb-6">We&apos;re here whenever you are.</p>
            <p className="text-sm leading-relaxed opacity-75">
              Whether you&apos;re looking for individual therapy, a corporate mental wellness programme, or support for your educational institute — we&apos;d love to hear from you.
            </p>
            <a
              href="https://wa.me/918879997299"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 bg-brand-offwhite text-brand-brown px-8 py-3 rounded-full text-xs tracking-widest uppercase font-medium hover:opacity-85 transition-opacity"
            >
              WhatsApp Us
            </a>
            {/* ponytail: Calendly link added when account created */}
            <p className="mt-5 text-xs leading-relaxed opacity-50">
              We respond to enquiries Mon–Sat, 9 AM–9 PM. Sessions are available Mon–Fri, 10 AM–7 PM. All conversations are completely confidential.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
