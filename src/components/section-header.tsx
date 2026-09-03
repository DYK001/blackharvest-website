interface SectionHeaderProps {
  headingId?: string;
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
}

export function SectionHeader({ headingId, index, eyebrow, title, description }: SectionHeaderProps) {
  return (
    <header className="section-header">
      <span className="section-header__index" aria-hidden="true">{index}</span>
      <div>
        <p className="eyebrow"><span aria-hidden="true" /> {eyebrow}</p>
        <h2 id={headingId}>{title}</h2>
        {description ? <p className="section-header__description">{description}</p> : null}
      </div>
    </header>
  );
}
