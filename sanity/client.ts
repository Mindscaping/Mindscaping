import { createClient } from "next-sanity";
import { sanityProjectId, sanityDataset, sanityApiVersion } from "@/lib/env";

// ponytail: return null client if not configured — avoids build hangs
const configured = Boolean(sanityProjectId);

export const client = configured
  ? createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: sanityApiVersion,
      useCdn: true,
    })
  : null;

/** Safe fetch — returns empty array when Sanity not configured */
export async function safeFetch(query: string, params?: Record<string, unknown>) {
  if (!client) return [];
  try {
    return await client.fetch(query, params);
  } catch {
    return [];
  }
}

/** Safe fetch one — returns null when Sanity not configured */
export async function safeFetchOne(query: string, params?: Record<string, unknown>) {
  if (!client) return null;
  try {
    return await client.fetch(query, params);
  } catch {
    return null;
  }
}
