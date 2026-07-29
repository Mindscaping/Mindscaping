"use client";

import { useReveal } from "@/hooks/useReveal";

const steps = [
  {
    num: "01",
    icon: "📋",
    title: "Consent & Intake",
    text: 'Once you reach out, a consent form is sent directly to your email. This helps us understand your needs, ensures transparency, and establishes a foundation of trust before your first session.',
  },
  {
    num: "02",
    icon: "✅",
    title: "Booking Confirmation",
    text: 'After reviewing and returning your consent form, we confirm your booking. This secures your slot and allows us to prepare for your session in advance.',
  },
  {
    num: "03",
    icon: "🌿",
    title: "Your Session",
    text: 'You are all set. Your session is scheduled with your counselor at a time that works for you — a dedicated, confidential space where your healing journey truly begins.',
  },
];

export default function ProcessSection() {
  const ref = useReveal();

  return (
    <section id="process" className="bg-brand-brown py-24" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <p className="reveal text-xs tracking-[0.2em] uppercase text-brand-light-taupe mb-4">How It Works</p>
        <h2 className="reveal font-serif text-[clamp(2.2rem,4vw,3.4rem)] font-light leading-tight text-brand-offwhite">
          Your journey, <em className="italic text-brand-light-taupe">step by step.</em>
        </h2>
        <div className="reveal mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.num}
              className="relative p-8 sm:p-10 border border-white/15 rounded-2xl bg-white/5"
            >
              <span className="font-serif text-6xl font-light text-white/10 absolute top-5 right-6 leading-none">
                {s.num}
              </span>
              <div className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center text-lg mb-6">
                {s.icon}
              </div>
              <h3 className="font-serif text-xl font-medium text-brand-offwhite mb-3">{s.title}</h3>
              <p className="text-sm leading-relaxed text-brand-light-taupe font-light">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
