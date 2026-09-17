"use client";

import { useReveal } from "@/hooks/useReveal";
import Image from "next/image";

interface Counsellor {
  name: string;
  role?: string;
  bio?: string;
  photo?: string;
}

interface Props {
  content?: {
    heading?: string;
    subtitle?: string;
    description?: string;
    members?: Counsellor[];
  } | null;
}

export default function SchoolCounsellingSection({ content }: Props) {
  const ref = useReveal();
  const heading = content?.heading || "School Counselling";
  const subtitle = content?.subtitle || "Supporting young minds in educational institutions";
  const description = content?.description || "";
  const members = content?.members || [];

  return (
    <section id="school-counselling" className="bg-brand-cream py-24" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-[600px] mb-14">
          <p className="text-xs tracking-[0.2em] uppercase text-brand-taupe mb-4">{subtitle}</p>
          <h2 className="font-serif text-[clamp(2.2rem,4vw,3.4rem)] font-light leading-tight text-brand-brown">
            {heading}
          </h2>
          {description && (
            <p className="text-brand-brown/80 font-light leading-relaxed mt-4">{description}</p>
          )}
        </div>

        {members.length === 0 && (
          <p className="text-brand-taupe italic font-serif text-lg">
            Our school counselling team is being assembled.
          </p>
        )}

        {members.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {members.map((m) => (
              <div
                key={m.name}
                className="reveal bg-brand-offwhite rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <div className="aspect-[3/4] relative bg-gradient-to-br from-brand-brown/15 to-brand-taupe/25">
                  {m.photo ? (
                    <Image src={m.photo} alt={m.name} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-5xl opacity-30 select-none">
                      ⊞
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5">
                  <p className="font-serif text-lg font-medium text-brand-brown">{m.name}</p>
                  {m.role && (
                    <p className="text-xs tracking-widest uppercase text-brand-taupe mb-1">{m.role}</p>
                  )}
                  {m.bio && (
                    <p className="text-sm leading-relaxed text-brand-brown/80 font-light mt-3">{m.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
