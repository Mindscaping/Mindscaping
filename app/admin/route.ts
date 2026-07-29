// ponytail: redirect /admin to /admin/ so relative URLs (config.yml) resolve correctly
import { redirect } from "next/navigation";

export function GET() {
  redirect("/admin/");
}
