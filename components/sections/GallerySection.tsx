"use client";

import { useReveal } from "@/hooks/useReveal";
import Image from "next/image";

interface GalleryImage {
  src: string;
  caption?: string;
}

interface Props {
  images: GalleryImage[];
}

export default function GallerySection({ images }: Props) {
  const ref = useReveal();
  if (!images.length) return null;

  return (
    <section id="gallery" className="bg-brand-offwhite py-20" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <p className="reveal text-xs tracking-[0.2em] uppercase text-brand-taupe mb-4">Our Space</p>
        <h2 className="reveal font-serif text-[clamp(2.2rem,4vw,3.4rem)] font-light leading-tight text-brand-brown">
          A Peek Into <em className="italic text-brand-taupe">Mindscaping.</em>
        </h2>
        <div className="reveal mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img) => (
            <div
              key={img.src}
              className="aspect-[4/3] rounded-xl overflow-hidden cursor-zoom-in"
              onClick={() => {
                const d = document.createElement("dialog");
                d.className = "fixed inset-0 bg-black/88 z-[9999] flex items-center justify-center w-full h-full border-0 cursor-zoom-out";
                d.onclick = () => d.close();
                d.innerHTML = `<img src="${img.src}" alt="${img.caption || "Gallery"}" class="max-w-[85vw] max-h-[85vh] rounded-xl shadow-2xl cursor-default" onclick="event.stopPropagation()" />`;
                document.body.appendChild(d);
                d.showModal();
                d.onclose = () => d.remove();
              }}
            >
              <Image
                src={img.src}
                alt={img.caption || "Gallery image"}
                width={420}
                height={315}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
