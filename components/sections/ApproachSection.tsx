"use client";

import { useEffect, useRef } from "react";

const skills = [
  { icon: "🧩", title: "Cognitive Agility", text: "Strengthen working memory and executive functioning through strategic resource management in games and puzzles." },
  { icon: "🎯", title: "Emotional Regulation", text: "Practice navigating &ldquo;unlucky&rdquo; shifts in Azul, Uno or even Snakes and Ladders with grace and humor." },
  { icon: "🌀", title: "Sensory Mindfulness", text: "Use Mandalas as repetitive, &ldquo;contained&rdquo; spaces to anchor focus, reduce anxiety, and quiet mental noise." },
  { icon: "💻", title: "Online Integration", text: "Digital sessions using virtual boards and screen-sharing ensure the same high-quality care as our in-person work." },
];

export default function ApproachSection() {
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
    <section id="approach" className="bg-brand-cream py-24" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-20">
          <div>
            <p className="reveal text-xs tracking-[0.2em] uppercase text-brand-taupe mb-4">Our Approach</p>
            <h2 className="reveal font-serif text-[clamp(2.2rem,4vw,3.4rem)] font-light leading-tight text-brand-brown">
              Where play meets <em className="italic text-brand-taupe">clinical rigour.</em>
            </h2>
            <p className="reveal mt-5 text-[0.98rem] leading-relaxed text-brand-brown/80 font-light">
              At Mindscaping, we go beyond traditional talk therapy by using games like Azul and Splendor, alongside structured art like Mandalas, as functional &ldquo;micro-labs&rdquo;. Whether in person or via interactive screen-sharing, you aren&apos;t just discussing skills like strategy and patience — you are living them in real-time.
            </p>
            <p className="reveal mt-4 text-[0.98rem] leading-relaxed text-brand-brown/80 font-light">
              By combining evidence-based modalities with these tactile, creative tools, we help you bridge the gap between the therapy room and your daily life.
            </p>
            <div className="reveal mt-8 p-6 sm:p-8 bg-brand-brown rounded-2xl">
              <p className="font-serif text-lg italic text-brand-offwhite/90 leading-relaxed">
                &ldquo;In a game of Splendor or Azul, you aren&apos;t just discussing strategy — you are living it.&rdquo;
              </p>
              <a href="/contact" className="inline-block mt-5 text-xs tracking-[0.15em] uppercase text-brand-light-taupe border-b border-brand-light-taupe/30 pb-0.5 hover:opacity-80 transition-opacity">
                Get in touch to learn more →
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {skills.map((s) => (
              <div
                key={s.title}
                className="reveal bg-brand-offwhite rounded-xl p-5 sm:p-6 flex gap-4 items-start hover:-translate-y-0.5 hover:shadow-md transition-all"
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{s.icon}</span>
                <div>
                  <h3 className="font-serif text-lg font-medium text-brand-brown mb-1">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-brand-brown/80 font-light">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
