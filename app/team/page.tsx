import type { Metadata } from "next";
import TeamSection from "@/components/sections/TeamSection";
import { getTeamMembers } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "Our Team",
  description: "Meet the Mindscaping team — experienced psychotherapists and clinical psychologists in Mumbai.",
};

export default async function TeamPage() {
  const members = await getTeamMembers();
  return <div className="pt-24"><TeamSection members={members} /></div>;
}
