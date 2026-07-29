"use client";

import { useReveal } from "@/hooks/useReveal";
import { useState } from "react";

interface FaqItem {
  _id: string;
  question: string;
  answer?: string;
}

interface Props {
  faqs: FaqItem[];
}

export default function FaqSection({ faqs }: Props) {
  const ref = useReveal();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="faq" className="bg-brand-offwhite py-24" ref={ref}>
      <div className="max-w-[780px] mx-auto px-6">
        <p className="reveal text-xs tracking-[0.2em] uppercase text-brand-taupe mb-4">Got Questions?</p>
        <h2 className="reveal font-serif text-[clamp(2.2rem,4vw,3.4rem)] font-light leading-tight text-brand-brown">
          Frequently asked <em className="italic text-brand-taupe">questions.</em>
        </h2>

        <div className="reveal mt-12 flex flex-col">
          {faqs.map((faq) => {
            const isOpen = openId === faq._id;
            return (
              <div
                key={faq._id}
                className="border-t border-brand-brown/15 py-6"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq._id)}
                  className="w-full flex justify-between items-center gap-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-lg font-medium text-brand-brown leading-snug">
                    {faq.question}
                  </span>
                  <span
                    className={`text-xl text-brand-taupe flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {isOpen && faq.answer && (
                  <div className="mt-4">
                    <p className="text-sm leading-relaxed text-brand-brown/80 font-light">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
          {/* Last border */}
          <div className="border-t border-b border-brand-brown/15 py-0" />
        </div>
      </div>
    </section>
  );
}
