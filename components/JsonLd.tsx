// ponytail: Schema.org JSON-LD for local psychiatry clinic SEO
export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: "Mindscaping",
    description:
      "Affordable, accessible mental health therapy in Mumbai. CBT, DBT, trauma-informed, neurodivergent & queer affirming care.",
    url: "https://mindscaping.in",
    telephone: "+918879997299",
    medicalSpecialty: "Psychiatric",
    priceRange: "₹₹",
    areaServed: { "@type": "City", name: "Mumbai" },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mumbai",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "21:00",
      },
    ],
    isAcceptingNewPatients: true,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
