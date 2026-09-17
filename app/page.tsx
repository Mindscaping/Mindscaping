import Hero from "@/components/sections/Hero";
import AboutSection from "@/components/sections/AboutSection";
import ValuesSection from "@/components/sections/ValuesSection";
import ApproachSection from "@/components/sections/ApproachSection";
import ProcessSection from "@/components/sections/ProcessSection";
import TeamSection from "@/components/sections/TeamSection";
import SchoolCounsellingSection from "@/components/sections/SchoolCounsellingSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import GallerySection from "@/components/sections/GallerySection";
import FaqSection from "@/components/sections/FaqSection";
import ContactSection from "@/components/sections/ContactSection";
import JsonLd from "@/components/JsonLd";
import {
  getTeamMembers,
  getSchoolCounselling,
  getTestimonials,
  getGalleryImages,
  getFaqs,
  getHeroContent,
  getAboutContent,
  getValuesContent,
  getApproachContent,
  getProcessContent,
} from "@/lib/content";

export default async function HomePage() {
  const [teamMembers, schoolCounselling, testimonials, galleryImages, faqs, hero, about, values, approach, process] =
    await Promise.all([
      getTeamMembers(),
      getSchoolCounselling(),
      getTestimonials(),
      getGalleryImages(),
      getFaqs(),
      getHeroContent(),
      getAboutContent(),
      getValuesContent(),
      getApproachContent(),
      getProcessContent(),
    ]);

  return (
    <>
      <JsonLd />
      <Hero content={hero} />
      <AboutSection content={about} />
      <ValuesSection content={values} />
      <ApproachSection content={approach} />
      <ProcessSection content={process} />
      <TeamSection members={teamMembers} />
      <SchoolCounsellingSection content={schoolCounselling} />
      <TestimonialsSection testimonials={testimonials} />
      <GallerySection images={galleryImages} />
      <FaqSection faqs={faqs} />
      <ContactSection />
    </>
  );
}
