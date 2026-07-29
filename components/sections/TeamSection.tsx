"use client";

import { useReveal } from "@/hooks/useReveal";
import Image from "next/image";

interface TeamMember {
  name: string;
  role?: string;
  credentials?: string;
  bio?: string;
  photo?: string;
  order?: number;
}

interface Props {
  members: TeamMember[];
}

export default function TeamSection({ members }: Props) {
  const ref = useReveal();

  return (
    <section id="team" className="bg-brand-cream py-24" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-[500px] mb-14">
          <p className="text-xs tracking-[0.2em] uppercase text-brand-taupe mb-4">The Mindscaping Team</p>
          <h2 className="font-serif text-[clamp(2.2rem,4vw,3.4rem)] font-light leading-tight text-brand-brown">
            Faces behind <em className="italic text-brand-taupe">your</em> care.
          </h2>
        </div>

        {members.length === 0 && (
          <p className="text-brand-taupe italic font-serif text-lg">Team members not yet added.</p>
        )}

        {members.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {members.map((m, idx) => (
              <div key={m.name} className="reveal bg-brand-offwhite rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all">
                <div className="aspect-[3/4] relative bg-gradient-to-br from-brand-brown/15 to-brand-taupe/25">
                  {m.photo ? (
                    <Image
                      src={m.photo}
                      alt={m.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-5xl opacity-30 select-none">⊞</div>
                  )}
                </div>
                <div className="p-4 sm:p-5">
                  <p className="font-serif text-lg font-medium text-brand-brown mb-1">{m.name}</p>
                  {m.role && <p className="text-xs tracking-widest uppercase text-brand-taupe mb-1">{m.role}</p>}
                  {m.credentials && (
                    <p className="font-serif italic text-sm text-brand-taupe mt-1">{m.credentials}</p>
                  )}
                  {m.bio && <p className="text-sm leading-relaxed text-brand-brown/80 font-light mt-3">{m.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
