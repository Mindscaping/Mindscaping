"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Login failed");
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
        <h1 className="text-3xl font-serif text-brand-brown mb-6 text-center">Welcome Back</h1>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-brown/70 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-brand-brown/20 focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-brown/70 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-brand-brown/20 focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
              required
            />
          </div>
          <Link href="/contact" className="block text-xs text-brand-brown/50 hover:text-brand-brown text-right -mt-2">
            Forgot password?
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-brown text-brand-offwhite py-3 rounded-full font-medium tracking-wider uppercase text-sm hover:bg-brand-taupe transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-brown/60">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand-brown hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
