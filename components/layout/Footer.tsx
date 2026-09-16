export default function Footer() {
  return (
    <footer className="bg-brand-brown text-brand-offwhite px-6 sm:px-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-brand-offwhite/10">
      <p className="font-serif text-xl">
        Mind<span className="italic text-brand-light-taupe">scaping</span>
      </p>
      <p className="text-xs tracking-wide opacity-40">
        Mindscaping &middot; UDYAM-MH-33-0518142 &middot; Mindful Healing
      </p>
      <p className="text-xs tracking-wide opacity-40">Mumbai, India</p>
    </footer>
  );
}
