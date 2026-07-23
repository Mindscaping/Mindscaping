"use client";

import { PortableText } from "@portabletext/react";

// ponytail: minimal portable text renderer — extend components if richer blocks needed
export default function PostBody({ content }: { content: any[] }) {
  return (
    <div className="prose prose-brand max-w-none">
      <PortableText value={content} />
    </div>
  );
}
