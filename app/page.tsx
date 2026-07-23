import Hero from "@/components/sections/Hero";
import AboutSection from "@/components/sections/AboutSection";
import ValuesSection from "@/components/sections/ValuesSection";
import ApproachSection from "@/components/sections/ApproachSection";
import ProcessSection from "@/components/sections/ProcessSection";
import TeamSection from "@/components/sections/TeamSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import GallerySection from "@/components/sections/GallerySection";
import FaqSection from "@/components/sections/FaqSection";
import ContactSection from "@/components/sections/ContactSection";
import JsonLd from "@/components/JsonLd";
import { getTeamMembers, getTestimonials, getGalleryImages, getFaqs } from "@/lib/content";

// ponytail: fetch all data in one page, pass as props — no layout shifts, no client waterfalls
export default async function HomePage() {
  const [teamMembers, testimonials, galleryImages, faqs] = await Promise.all([
    getTeamMembers(),
    getTestimonials(),
    getGalleryImages(),
    getFaqs(),
  ]);

  return (
    <>
      <JsonLd />
      <Hero />
      <AboutSection />
      <ValuesSection />
      <ApproachSection />
      <ProcessSection />
      <TeamSection members={teamMembers} />
      <TestimonialsSection testimonials={testimonials} />
      <GallerySection images={galleryImages} />
      <FaqSection faqs={faqs} />
      <ContactSection />
    </>
  );
}
