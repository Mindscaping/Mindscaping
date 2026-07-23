import Link from "next/link";
import Image from "next/image";

interface Post {
  title: string;
  slug?: string;
  excerpt?: string;
  featuredImage?: string;
  publishedAt?: string;
  author?: string;
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-brand-offwhite rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all border border-brand-brown/5"
    >
      {post.featuredImage && (
        <div className="aspect-[16/9] relative overflow-hidden">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-5">
        {post.publishedAt && (
          <p className="text-xs text-brand-taupe mb-2">
            {new Date(post.publishedAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
        <h3 className="font-serif text-xl font-medium text-brand-brown mb-2 group-hover:text-brand-taupe transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm leading-relaxed text-brand-brown/70 font-light line-clamp-2">{post.excerpt}</p>
        )}
        {post.author && (
          <p className="text-xs text-brand-taupe mt-3">By {post.author}</p>
        )}
      </div>
    </Link>
  );
}
