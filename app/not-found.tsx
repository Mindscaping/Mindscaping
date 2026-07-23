import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-8xl font-light text-brand-taupe/30">404</p>
      <h1 className="font-serif text-3xl font-light text-brand-brown mt-4 mb-2">
        Page not found
      </h1>
      <p className="text-sm text-brand-brown/60 mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-brand-brown text-brand-offwhite px-8 py-3 rounded-full text-xs tracking-widest uppercase hover:bg-brand-taupe transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
