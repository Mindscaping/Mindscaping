interface Props {
  tag?: string;
  title: string;
  highlight?: string;
  className?: string;
}

// ponytail: one component for all section headings — tag + title + italic highlight
export default function SectionHeading({ tag, title, highlight, className = "" }: Props) {
  return (
    <div className={className}>
      {tag && <p className="text-xs tracking-[0.2em] uppercase text-brand-taupe mb-4">{tag}</p>}
      <h2 className="font-serif text-[clamp(2.2rem,4vw,3.4rem)] font-light leading-tight text-brand-brown">
        {title.split(highlight || "____").map((part, i) =>
          i === 0 && highlight ? (
            part
          ) : i === 1 && highlight ? (
            <>
              <em className="italic text-brand-taupe">{highlight}</em>
              {part}
            </>
          ) : (
            part
          ),
        )}
      </h2>
    </div>
  );
}
