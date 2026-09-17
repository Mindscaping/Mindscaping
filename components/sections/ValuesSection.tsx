"use client";

import { useReveal } from "@/hooks/useReveal";

type ValuesContent = {
  heading: string;
  intro: string;
  items: { num: string; title: string; text: string }[];
};

const defaultValues = [
  {
    num: "01",
    title: "Evidence-Based Clinical Care",
    text: "We rely on proven, scientifically-backed therapeutic modalities such as Cognitive Behavioral Therapy (CBT) and Dialectical Behavior Therapy (DBT). Every treatment plan is grounded in clinical assessments to ensure our interventions are effective, structured, and goal-oriented.",
  },
  {
    num: "02",
    title: "Holistic Psychological Integration",
    text: "While our focus is psychological, we view the individual as a whole. We look at the interplay between a client\u2019s emotional state, cognitive patterns, and their environment. We don\u2019t just treat symptoms; we work to understand the underlying narratives and social contexts.",
  },
  {
    num: "03",
    title: "Ecosystemic Growth",
    text: "We believe that healing happens best in supportive environments. Our mission extends beyond the therapy room to building and sustaining mental health ecosystems within educational institutes, colleges, and corporate organizations \u2014 fostering resilience at the institutional level.",
  },
  {
    num: "04",
    title: "Inclusive & Affirming Spaces",
    text: "Our values are rooted in safety, authenticity, and clinical rigour. We are dedicated to providing evidence-based, client-centered care that is neurodivergent and queer-affirming \u2014 ensuring that individuals from all walks of life feel seen, respected, and supported in their unique identities.",
  },
];

export default function ValuesSection({ content }: { content?: ValuesContent }) {
  const ref = useReveal();
  const values = content?.items || defaultValues;
  return (
    <section id="values" className="py-24" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <p className="reveal text-xs tracking-[0.2em] uppercase text-brand-taupe mb-4">Our Values &amp; Approach</p>
        <h2 className="reveal font-serif text-[clamp(2.2rem,4vw,3.4rem)] font-light leading-tight text-brand-brown">
          {(content?.heading || "What guides us.").split("guides").map((part, i) =>
            i === 0 ? <>{part}<em className="italic text-brand-taupe">guides</em></> : <>{part}</>
          )}
        </h2>
        <p className="reveal mt-5 max-w-[560px] text-[0.98rem] leading-relaxed text-brand-taupe font-light">
          {content?.intro || "At Mindscaping, we believe that mental health is not a standalone experience but a deeply integrated part of a person\u2019s entire psychological and social world."}
        </p>

        <div className="reveal mt-14 grid grid-cols-1 sm:grid-cols-2 border border-brand-brown/10 rounded-2xl overflow-hidden">
          {values.map((v) => (
            <div key={v.num} className="p-10 border border-brand-brown/10 bg-brand-offwhite hover:bg-brand-cream transition-colors">
              <p className="font-serif text-5xl font-light text-brand-brown/15 leading-none mb-4">{v.num}</p>
              <h3 className="font-serif text-xl font-medium text-brand-brown mb-3">{v.title}</h3>
              <p className="text-sm leading-relaxed text-brand-brown/80 font-light">{v.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
