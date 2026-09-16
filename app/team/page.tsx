import type { Metadata } from "next";
import TeamSection from "@/components/sections/TeamSection";
import { getMergedTeamData } from "@/lib/team-sync";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Team",
  description: "Meet the Mindscaping team — experienced psychotherapists and clinical psychologists in Mumbai.",
};

export default async function TeamPage() {
  const members = await getMergedTeamData();
  return <div className="pt-24"><TeamSection members={members} /></div>;
}
