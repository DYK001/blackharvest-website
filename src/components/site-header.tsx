import Link from "next/link";

export function SiteHeader({
  backHref,
  backLabel,
}: {
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link className="wordmark" href="/#top" aria-label="Black Harvest home">
          <span className="wordmark__sigil" aria-hidden="true">
            <span>BH</span>
          </span>
          <span className="wordmark__name">Black Harvest</span>
        </Link>

        {backHref && backLabel ? (
          <Link className="header-return" href={backHref}>
            <span aria-hidden="true">←</span> {backLabel}
          </Link>
        ) : (
          <nav aria-label="Primary navigation">
            <Link href="/#development">Development</Link>
            <Link href="/#roadmap">Roadmap</Link>
            <Link href="/#project">Systems</Link>
            <Link href="/#devlog">Devlog</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
