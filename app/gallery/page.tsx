import type { Metadata } from "next";
import GallerySection from "@/components/sections/GallerySection";
import { getGalleryImages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A peek into Mindscaping — our space and community events.",
};

export default async function GalleryPage() {
  const images = await getGalleryImages();
  return <div className="pt-24"><GallerySection images={images} /></div>;
}
