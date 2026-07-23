import type { Metadata } from "next";
import Link from "next/link";
import PostCard from "@/components/blog/PostCard";
import { getPosts } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "Blog",
  description: "Mindscaping blog — insights on mental health, therapy, and well-being.",
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6">
      <p className="text-xs tracking-[0.2em] uppercase text-brand-taupe mb-4">Mindscaping Blog</p>
      <h1 className="font-serif text-[clamp(2.2rem,4vw,3.4rem)] font-light leading-tight text-brand-brown mb-12">
        Insights for <em className="italic text-brand-taupe">well-being.</em>
      </h1>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-serif text-xl italic text-brand-taupe mb-4">No blog posts yet.</p>
          <p className="text-sm text-brand-brown/60">
            In the meantime, visit our{" "}
            <Link href="https://cognitivecompass.blogspot.com" target="_blank" className="underline text-brand-brown">
              external blog
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: any) => <PostCard key={post._id} post={post} />)}
        </div>
      )}
    </div>
  );
}
