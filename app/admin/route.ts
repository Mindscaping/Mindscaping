// ponytail: redirect /admin → /admin/index.html (avoids trailing-slash redirect loop)
import { redirect } from "next/navigation";

export function GET() {
  redirect("/admin/index.html");
}
