import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <div>
          <span className="site-footer__title">Black Harvest</span>
          <span>Currently in development.</span>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/#development">Development</Link>
          <Link href="/#roadmap">Roadmap</Link>
          <Link href="/#devlog">Devlog</Link>
          <Link href="/#top">Top <span aria-hidden="true">↑</span></Link>
        </nav>
      </div>
    </footer>
  );
}
