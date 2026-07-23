"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface GalleryImage {
  _id: string;
  image: any;
  caption?: string;
}

interface Props {
  images: GalleryImage[];
}

export default function GallerySection({ images }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

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

  const scroll = (dir: number) => {
    if (!carouselRef.current) return;
    const w = 420 + 19.2;
    carouselRef.current.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / (420 + 19.2));
      setCurrent(idx);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };
  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  };
  const shift = (dir: number) => {
    setLightboxIdx((prev) => (prev + dir + images.length) % images.length);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") shift(1);
      if (e.key === "ArrowLeft") shift(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  if (!images.length) return null;

  return (
    <section id="gallery" className="bg-brand-offwhite py-20" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <p className="reveal text-xs tracking-[0.2em] uppercase text-brand-taupe mb-4">Our Space</p>
        <h2 className="reveal font-serif text-[clamp(2.2rem,4vw,3.4rem)] font-light leading-tight text-brand-brown">
          A Peek Into <em className="italic text-brand-taupe">Mindscaping.</em>
        </h2>

        <div className="reveal relative mt-12">
          <div
            ref={carouselRef}
            className="flex gap-5 overflow-x-auto scroll-smooth [scrollbar-width:none] pb-2"
          >
            {images.map((img, i) => (
              <div
                key={img._id}
                onClick={() => openLightbox(i)}
                className="flex-[0_0_420px] aspect-[4/3] rounded-xl overflow-hidden cursor-zoom-in"
              >
                <Image
                  src={img.image}
                  alt={img.caption || "Gallery image"}
                  width={420}
                  height={315}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll(-1)}
            className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 bg-white rounded-full w-12 h-12 shadow-lg flex items-center justify-center text-lg z-10 hover:shadow-xl transition-shadow"
            aria-label="Previous"
          >
            &#8592;
          </button>
          <button
            onClick={() => scroll(1)}
            className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 bg-white rounded-full w-12 h-12 shadow-lg flex items-center justify-center text-lg z-10 hover:shadow-xl transition-shadow"
            aria-label="Next"
          >
            &#8594;
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {images.map((_, i) => (
            <span
              key={i}
              onClick={() => {
                if (carouselRef.current) {
                  carouselRef.current.scrollTo({ left: i * (420 + 19.2), behavior: "smooth" });
                }
              }}
              className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                i === current ? "bg-brand-brown" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/88 z-[9999] flex items-center justify-center cursor-zoom-out"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => { e.stopPropagation(); shift(-1); }}
            className="fixed left-4 sm:left-8 top-1/2 -translate-y-1/2 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-10"
            aria-label="Previous image"
          >
            &#8592;
          </button>
          <Image
            src={images[lightboxIdx].image}
            alt={images[lightboxIdx].caption || "Gallery"}
            width={1200}
            height={900}
            className="max-w-[85vw] max-h-[85vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); shift(1); }}
            className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-10"
            aria-label="Next image"
          >
            &#8594;
          </button>
          <button
            onClick={closeLightbox}
            className="fixed top-4 sm:top-6 right-4 sm:right-8 text-white text-4xl cursor-pointer leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
      )}
    </section>
  );
}
