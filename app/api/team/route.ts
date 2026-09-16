import { NextResponse } from "next/server";
import { getMergedTeamData } from "@/lib/team-sync";

export async function GET() {
  const team = await getMergedTeamData();
  return NextResponse.json({ team });
}
