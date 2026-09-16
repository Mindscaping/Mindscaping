"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  role: string;
}

const publicLinks = [
  { href: "/#approach", label: "Our Approach" },
  { href: "/team", label: "Team" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
  { href: "/book", label: "Book" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-16 py-3 bg-brand-offwhite/88 backdrop-blur-md border-b border-brand-brown/10">
      {/* Logo */}
      <Link href="/" className="flex flex-col items-center gap-1">
        <Image
          src="/images/logo.jpg"
          alt="Mindscaping logo"
          width={90}
          height={55}
          className="h-auto w-auto"
          priority
        />
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6">
        {publicLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-xs tracking-widest uppercase text-brand-brown/75 hover:text-brand-brown transition-colors"
          >
            {l.label}
          </Link>
        ))}
        <a
          href="https://mindscapingresearch.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs tracking-widest uppercase text-brand-brown/75 hover:text-brand-brown transition-colors"
        >
          Research
        </a>

        {user ? (
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs tracking-widest uppercase text-brand-brown/75 hover:text-brand-brown transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs tracking-widest uppercase text-brand-brown/75 hover:text-brand-brown transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs tracking-widest uppercase text-brand-brown/75 hover:text-brand-brown transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-brand-brown text-brand-offwhite px-5 py-2.5 rounded-full text-xs tracking-widest uppercase font-medium hover:bg-brand-taupe transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>

      {/* Hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden flex flex-col gap-1.5 p-2"
        aria-label="Menu"
      >
        <span className={["block w-6 h-0.5 bg-brand-brown transition-transform", open && "rotate-45 translate-y-2"].filter(Boolean).join(' ')} />
        <span className={["block w-6 h-0.5 bg-brand-brown transition-opacity", open && "opacity-0"].filter(Boolean).join(' ')} />
        <span className={["block w-6 h-0.5 bg-brand-brown transition-transform", open && "-rotate-45 -translate-y-2"].filter(Boolean).join(' ')} />
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-brand-offwhite border-b border-brand-brown/10 flex flex-col p-6 gap-4 md:hidden">
          {publicLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm tracking-widest uppercase text-brand-brown/75"
            >
              {l.label}
            </Link>
          ))}
          <a
            href="https://mindscapingresearch.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm tracking-widest uppercase text-brand-brown/75"
            onClick={() => setOpen(false)}
          >
            Research
          </a>

          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="text-sm tracking-widest uppercase text-brand-brown/75"
              >
                Dashboard
              </Link>
              <button
                onClick={() => { setOpen(false); handleLogout(); }}
                className="text-sm tracking-widest uppercase text-brand-brown/75 text-left"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-sm tracking-widest uppercase text-brand-brown/75"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="bg-brand-brown text-brand-offwhite px-5 py-2.5 rounded-full text-xs tracking-widest uppercase text-center"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
