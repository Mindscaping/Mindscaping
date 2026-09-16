"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.replace("/login");
        } else if (data.user.role === "clinician") {
          router.replace("/dashboard/clinician");
        } else {
          router.replace("/dashboard/patient");
        }
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center pt-24">
      <div className="w-8 h-8 border-2 border-brand-brown border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
