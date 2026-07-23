import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostBody from "@/components/blog/PostBody";
import { getPost, getPosts } from "@/lib/sanity";
import { urlFor } from "@/lib/sanity";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.filter((p: any) => p.slug?.current).map((p: any) => ({ slug: p.slug.current }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug) as any;
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      ...(post.featuredImage && urlFor(post.featuredImage)
        ? { images: [{ url: urlFor(post.featuredImage)!.width(1200).height(630).url() }] }
        : {}),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug) as any;
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

      {post.featuredImage && urlFor(post.featuredImage) && (
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-10">
          <Image
            src={urlFor(post.featuredImage)!.width(1200).height(675).url()}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {post.content && <PostBody content={post.content} />}
    </article>
  );
}
