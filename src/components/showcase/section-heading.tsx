interface SectionHeadingProps {
  description: string;
  title: string;
}

function SectionHeading({ description, title }: SectionHeadingProps) {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <h2 className="font-heading font-semibold text-2xl tracking-tight sm:text-3xl">{title}</h2>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

export { SectionHeading };
