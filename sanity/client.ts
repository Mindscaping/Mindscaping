import { createClient } from "next-sanity";

// ponytail: inlined from lib/env.ts
const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const sanityApiVersion = "2025-01-01";

const configured = Boolean(sanityProjectId);

export const client = configured
  ? createClient({ projectId: sanityProjectId, dataset: sanityDataset, apiVersion: sanityApiVersion, useCdn: true })
  : null;

export async function safeFetch(query: string, params?: Record<string, unknown>) {
  if (!client) return [];
  try { return await client.fetch(query, params); } catch { return []; }
}

export async function safeFetchOne(query: string, params?: Record<string, unknown>) {
  if (!client) return null;
  try { return await client.fetch(query, params); } catch { return null; }
}
