import { remark } from "remark";
import html from "remark-html";

interface Props {
  content: string;
}

export default async function PostBody({ content }: Props) {
  const result = await remark().use(html).process(content);
  return (
    <div
      className="prose prose-brand max-w-none text-sm leading-relaxed text-brand-brown/80 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-brand-brown [&_h2]:mt-8 [&_h2]:mb-4 [&_p]:mb-4 [&_a]:text-brand-brown [&_a]:underline"
      dangerouslySetInnerHTML={{ __html: result.toString() }}
    />
  );
}
