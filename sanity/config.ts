import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schema";
import { sanityProjectId, sanityDataset } from "@/lib/env";

const sanityConfig = defineConfig({
  name: "mindscaping",
  title: "Mindscaping",
  projectId: sanityProjectId,
  dataset: sanityDataset,
  plugins: [structureTool()],
  schema: { types: schemaTypes },
  basePath: "/studio",
});

export default sanityConfig;
