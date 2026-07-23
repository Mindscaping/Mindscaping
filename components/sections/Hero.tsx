"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const children = el.querySelectorAll(".fade-in");
    children.forEach((c, i) => {
      setTimeout(() => (c as HTMLElement).style.opacity = "1", 200 + i * 200);
    });
  }, []);

  return (
    <section className="min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_420px] pt-20">
      {/* Left */}
      <div
        ref={ref}
        className="flex flex-col justify-center px-6 sm:px-20 py-20 relative overflow-hidden"
      >
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-brand-taupe/10 to-transparent pointer-events-none" />

        <p className="fade-in text-xs tracking-[0.18em] uppercase text-brand-taupe mb-8 opacity-0 transition-opacity duration-700">
          Mindful Healing &middot; Accessible Care
        </p>
        <h1 className="fade-in font-serif text-[clamp(3.2rem,6vw,5.5rem)] leading-[1.05] font-light text-brand-brown opacity-0 transition-opacity duration-700">
          Healing that <em className="italic text-brand-taupe">begins</em>
          <br /> with you.
        </h1>
        <p className="fade-in mt-6 text-base leading-relaxed text-brand-brown/80 font-light max-w-[460px] opacity-0 transition-opacity duration-700">
          Affordable, high-quality psychological support for individuals from all walks of life — grounded in empathy, evidence, and authenticity.
        </p>
        <div className="fade-in mt-10 flex flex-wrap gap-4 opacity-0 transition-opacity duration-700">
          <Link
            href="/contact"
            className="bg-brand-brown text-brand-offwhite px-8 py-3 rounded-full text-xs tracking-[0.1em] uppercase hover:bg-brand-taupe hover:-translate-y-0.5 transition-all"
          >
            Begin Your Healing Journey
          </Link>
          <Link
            href="/#about"
            className="border border-brand-brown text-brand-brown px-8 py-3 rounded-full text-xs tracking-[0.1em] uppercase hover:bg-brand-brown hover:text-brand-offwhite hover:-translate-y-0.5 transition-all"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Right */}
      <div className="bg-brand-brown flex flex-col items-center justify-center p-10 sm:p-16 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-[300px] h-[300px] rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 w-[360px] h-[360px] rounded-full bg-white/4" />

        {/* Floral SVG */}
        <svg className="absolute w-[200px] h-[200px] opacity-[0.18] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="#F0EEFF" strokeWidth="1" />
          <circle cx="100" cy="100" r="60" stroke="#F0EEFF" strokeWidth="1" strokeDasharray="4 6" />
          <path d="M100 10 Q120 55 100 100 Q80 55 100 10Z" fill="#F0EEFF" opacity="0.4" />
          <path d="M100 190 Q120 145 100 100 Q80 145 100 190Z" fill="#F0EEFF" opacity="0.4" />
          <path d="M10 100 Q55 120 100 100 Q55 80 10 100Z" fill="#F0EEFF" opacity="0.4" />
          <path d="M190 100 Q145 120 100 100 Q145 80 190 100Z" fill="#F0EEFF" opacity="0.4" />
          <circle cx="100" cy="100" r="10" fill="#F0EEFF" opacity="0.3" />
        </svg>

        <div className="relative z-10 text-center text-brand-offwhite">
          <p className="font-serif text-2xl sm:text-3xl font-light italic leading-relaxed opacity-90 mb-8">
            &ldquo;Mental health is not a destination, but a process.&rdquo;
          </p>
          <p className="text-xs tracking-[0.2em] uppercase text-brand-light-taupe">Mindscaping &middot; Mumbai</p>

          <div className="mt-12 flex flex-col gap-6 w-full">
            <div className="border-t border-white/20 pt-5 flex justify-between items-start">
              <span className="text-xs tracking-widest uppercase opacity-60">Specialisation</span>
              <span className="font-serif text-lg opacity-90">CBT &middot; DBT &middot; Trauma-Informed</span>
            </div>
            <div className="border-t border-white/20 pt-5 flex justify-between items-start">
              <span className="text-xs tracking-widest uppercase opacity-60">Spaces</span>
              <span className="font-serif text-lg opacity-90">Individual &middot; Corporate &middot; Schools</span>
            </div>
            <div className="border-t border-white/20 pt-5 flex justify-between items-start">
              <span className="text-xs tracking-widest uppercase opacity-60">Approach</span>
              <span className="font-serif text-lg opacity-90">Evidence-Based &middot; Client-Centered &middot; Affirming</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
