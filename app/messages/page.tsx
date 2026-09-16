import { Suspense } from "react";
import MessagesContent from "./MessagesContent";

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center pt-24"><p className="text-brand-brown/60">Loading...</p></div>}>
      <MessagesContent />
    </Suspense>
  );
}
