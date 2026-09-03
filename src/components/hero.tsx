import { HeroMedia } from "@/components/media/hero-media";
import { SiteHeader } from "@/components/site-header";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <a className="skip-link" href="#development">Skip to development</a>
      <HeroMedia />
      <SiteHeader />

      <div className="hero__content shell" id="top">
        <div className="hero__status">
          <span aria-hidden="true">I</span>
          <span>In development</span>
        </div>
        <h1 id="hero-title" aria-label="Black Harvest"><span>Black</span><span>Harvest</span></h1>
        <p className="hero__subtitle">Medieval Open-World Survival</p>
        <p className="hero__copy">
          A grounded third-person survival project shaped by melee combat,
          hostile infected, and an unforgiving open world.
        </p>
        <div className="hero__actions">
          <a className="button button--primary" href="#development"><span>View development</span><span aria-hidden="true">↓</span></a>
          <a className="button button--secondary" href="#project"><span>Explore project</span><span aria-hidden="true">↘</span></a>
        </div>
      </div>

      <div className="hero__footer shell" aria-hidden="true">
        <span>Development record · Vol. I</span>
        <span className="hero__line" />
        <span>Official project journal</span>
      </div>
    </section>
  );
}
