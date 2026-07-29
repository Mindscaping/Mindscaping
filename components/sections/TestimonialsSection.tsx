"use client";

import { useReveal } from "@/hooks/useReveal";

interface Testimonial {
  _id: string;
  name?: string;
  quote: string;
}

interface Props {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: Props) {
  const ref = useReveal();

  return (
    <section id="testimonials" className="bg-brand-brown py-24" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <p className="reveal text-xs tracking-[0.2em] uppercase text-brand-light-taupe mb-4">Client Stories</p>
        <h2 className="reveal font-serif text-[clamp(2.2rem,4vw,3.4rem)] font-light leading-tight text-brand-offwhite">
          Voices of <em className="italic text-brand-light-taupe">healing.</em>
        </h2>

        <div className="reveal mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t._id} className="bg-white/8 border border-white/15 rounded-xl p-6 sm:p-8 hover:bg-white/10 transition-colors relative">
              <span className="font-serif text-6xl leading-none text-white/10 absolute top-4 left-5">&ldquo;</span>
              <p className="font-serif text-lg italic leading-relaxed text-brand-offwhite/85 relative z-10">
                {t.quote}
              </p>
              {t.name && <p className="mt-4 text-xs tracking-widest uppercase text-brand-light-taupe">— {t.name}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
