"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "patient" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          router.replace(data.user.role === "clinician" ? "/dashboard/clinician" : "/dashboard/patient");
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => setCheckingAuth(false));
  }, [router]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      const msg = data.error || "Registration failed";
      if (msg.includes("already registered") || msg.includes("409")) {
        setError("__DUPLICATE__");
      } else {
        setError(msg);
      }
      setLoading(false);
      return;
    }

    router.push(data.role === "clinician" ? "/dashboard/clinician" : "/dashboard/patient");
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="w-8 h-8 border-2 border-brand-brown border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-serif text-brand-brown mb-6 text-center">Create Account</h1>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error === "__DUPLICATE__" ? (
              <>An account with this email already exists. <Link href="/login" className="underline font-medium">Try logging in instead.</Link></>
            ) : error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-brown/70 mb-1">I am a</label>
            <div className="flex gap-3">
              {(["patient", "clinician"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => update("role", r)}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium uppercase tracking-wider transition-colors ${
                    form.role === r
                      ? "bg-brand-brown text-brand-offwhite"
                      : "bg-brand-offwhite text-brand-brown border border-brand-brown/20"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-brown/70 mb-1">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-brand-brown/20 focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-brown/70 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-brand-brown/20 focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-brown/70 mb-1">Phone (optional)</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-brand-brown/20 focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-brown/70 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className="w-full px-4 py-3 rounded-lg border border-brand-brown/20 focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
              required
              minLength={8}
            />
            {(passwordFocused || form.password.length > 0) && form.password.length < 8 && (
              <p className="text-xs text-brand-brown/50 mt-1">Minimum 8 characters</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-brown text-brand-offwhite py-3 rounded-full font-medium tracking-wider uppercase text-sm hover:bg-brand-taupe transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-brown/60">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-brown hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
