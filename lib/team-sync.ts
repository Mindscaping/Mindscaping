import { readFileSync } from "fs";
import { join } from "path";
import { prisma } from "./db";

interface CMSMember {
  name: string;
  role: string;
  image: string;
  bio?: string;
  qualifications?: string;
  languages?: string[];
  specialisations?: string[];
  publications?: string[];
}

export function getTeamData(): CMSMember[] {
  try {
    const raw = readFileSync(join(process.cwd(), "content", "team.json"), "utf-8");
    const data = JSON.parse(raw);
    return data.members || data;
  } catch {
    return [];
  }
}

export async function getMergedTeamData(): Promise<CMSMember[]> {
  const cmsMembers = getTeamData();
  const clinicians = await prisma.user.findMany({
    where: { role: "clinician" },
    select: { name: true, email: true, id: true },
  });

  return cmsMembers.map((cms) => {
    const clinician = clinicians.find((c) => c.name === cms.name);
    return {
      ...cms,
      hasAccount: !!clinician,
      clinicianId: clinician?.id || null,
    };
  });
}
