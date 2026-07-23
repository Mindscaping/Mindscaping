// ponytail: minimal login — email + password, posts to Better Auth API
"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Invalid email or password");
      return;
    }
    const data = await res.json();
    if (data.token) document.cookie = `better-auth.session=${data.token}; path=/; secure; samesite=lax`;
    router.push("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-offwhite px-6">
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-sm border border-brand-brown/10">
        <h1 className="font-serif text-2xl font-light text-brand-brown mb-1">Admin Login</h1>
        <p className="text-sm text-brand-taupe mb-6">Mindscaping CMS</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs tracking-widest uppercase text-brand-brown/60 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-brand-brown/20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-brown/40"
              required
            />
          </div>
          <div>
            <label className="text-xs tracking-widest uppercase text-brand-brown/60 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-brand-brown/20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-brown/40"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-brand-brown text-brand-offwhite rounded-full py-2.5 text-xs tracking-widest uppercase hover:bg-brand-taupe transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
