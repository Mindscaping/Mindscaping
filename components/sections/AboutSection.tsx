"use client";

import { useReveal } from "@/hooks/useReveal";

type AboutContent = {
  heading: string;
  paragraphs: string[];
  missionTitle: string;
  missionText: string;
};

const defaultParagraphs = [
  "Mindscaping is a mental health initiative dedicated to making therapy accessible to a wider audience. Our goal is to provide high-quality, affordable psychological support to individuals from all walks of life.",
  "We are driven by a client-centered approach, prioritizing accessibility, empathy, and holistic well-being. We value inclusivity, continuous learning, and personalized care, ensuring that mental health support is tailored to each individual\u2019s unique needs.",
  "Our team excels in patient assessments, diagnosis, and treatment for a wide range of concerns, including stress, anxiety, depression, trauma, and relationship issues. With a strong foundation in evidence-based practices, we are dedicated to helping clients achieve emotional resilience.",
  "Beyond individual care, Mindscaping is committed to fostering mental wellness at a systemic level \u2014 building a sustainable mental health ecosystem for educational institutes, colleges, and corporate environments.",
];

export default function AboutSection({ content }: { content?: AboutContent }) {
  const ref = useReveal();
  const paragraphs = content?.paragraphs || defaultParagraphs;
  return (
    <section id="about" className="bg-brand-cream py-24" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <p className="reveal text-xs tracking-[0.2em] uppercase text-brand-taupe mb-6">Home / About Us</p>
        <h2 className="reveal font-serif text-[clamp(2.2rem,4vw,3.4rem)] font-light leading-tight text-brand-brown">
          {(content?.heading || "Making therapy accessible for everyone.").split("accessible").map((part, i) =>
            i === 0 ? <>{part}<em className="italic text-brand-taupe">accessible</em></> : <>{part}</>
          )}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-20 mt-14">
          <div className="space-y-5">
            {paragraphs.map((p, i) => (
              <p key={i} className="reveal text-[0.98rem] leading-relaxed text-brand-brown/80 font-light">
                {p}
              </p>
            ))}
          </div>
          <div className="reveal">
            <div className="bg-brand-brown text-brand-offwhite rounded-2xl p-10 h-full flex flex-col justify-end relative overflow-hidden">
              <div className="absolute top-8 right-8 text-6xl opacity-[0.12] font-serif">&#10086;</div>
              <p className="text-xs tracking-[0.15em] uppercase opacity-50 mb-4">Our Mission</p>
              <p className="font-serif text-xl sm:text-2xl font-light italic mb-3">
                {content?.missionTitle || "Building an Ecosystem for Growth"}
              </p>
              <p className="text-sm leading-relaxed opacity-70">
                {content?.missionText || "We aim to support and build a sustainable mental health ecosystem for educational institutes, colleges, and corporate environments \u2014 ensuring that professional and educational spaces become sanctuaries for emotional resilience and collective well-being."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
