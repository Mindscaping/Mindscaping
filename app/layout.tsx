import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "@/styles/globals.css";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-serif",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: { default: "Mindscaping — Mindful Healing", template: "%s | Mindscaping" },
  description:
    "Mindscaping offers affordable, accessible mental health therapy in Mumbai. Specialising in CBT, DBT, trauma-informed care, and neurodivergent & queer affirming support.",
  metadataBase: new URL("https://mindscaping.in"),
  openGraph: {
    title: "Mindscaping — Mindful Healing",
    description:
      "Affordable, accessible mental health support in Mumbai. CBT, DBT, trauma-informed and queer affirming care.",
    url: "https://mindscaping.in",
    siteName: "Mindscaping",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="font-sans text-brand-brown bg-brand-offwhite antialiased">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
