import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { getPost, getPosts } from "@/lib/content";

interface Props {
  params: Promise<{ slug: string }>;
}

interface PostFields {
  title?: string;
  excerpt?: string;
  author?: string;
  publishedAt?: string;
  featuredImage?: string;
  content?: string;
}

export async function generateStaticParams() {
  const posts = getPosts();
  return posts.filter((p) => p.slug).map((p) => ({ slug: p.slug as string }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!/^[a-z0-9-]+$/.test(slug)) return notFound();
  const post = getPost(slug) as PostFields | null;
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      ...(post.featuredImage ? { images: [{ url: post.featuredImage }] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  if (!/^[a-z0-9-]+$/.test(slug)) return notFound();
  const post = getPost(slug) as PostFields | null;
  if (!post) notFound();

  return (
    <article className="pt-32 pb-24 max-w-3xl mx-auto px-6">
      <Link href="/blog" className="text-xs tracking-widest uppercase text-brand-taupe hover:text-brand-brown transition-colors">
        &larr; Back to Blog
      </Link>

      <h1 className="font-serif text-4xl sm:text-5xl font-light leading-tight text-brand-brown mt-8 mb-4">
        {post.title}
      </h1>

      <div className="flex items-center gap-4 text-sm text-brand-taupe mb-8">
        {post.author && <span>By {post.author}</span>}
        {post.publishedAt && (
          <>
            <span>&middot;</span>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </>
        )}
      </div>

      {post.featuredImage && (
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-10">
          <Image
            src={post.featuredImage}
            alt={post.title || "Blog post"}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {post.content && (
        <div className="prose prose-brand max-w-none text-sm leading-relaxed text-brand-brown/80">
          <Markdown>{post.content}</Markdown>
        </div>
      )}
    </article>
  );
}
