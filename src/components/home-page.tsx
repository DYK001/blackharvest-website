import { ActivityFeed } from "@/components/activity-feed";
import { CurrentTask } from "@/components/current-task";
import { DevLogPreview } from "@/components/dev-log-preview";
import { DevelopmentStatus } from "@/components/development-status";
import { GameSystems } from "@/components/game-systems";
import { Hero } from "@/components/hero";
import { MediaShowcase } from "@/components/media/media-showcase";
import { Roadmap } from "@/components/roadmap";
import { SiteFooter } from "@/components/site-footer";
import { SystemStatusGrid } from "@/components/system-status-grid";
import type { Locale } from "@/i18n";

export function HomePage({ locale }: { locale: Locale }) {
  return (
    <div className="locale-root" data-locale={locale} lang={locale}>
      <main>
        <Hero locale={locale} />
        <DevelopmentStatus locale={locale} />
        <MediaShowcase locale={locale} />
        <GameSystems locale={locale} />
        <SystemStatusGrid locale={locale} />
        <CurrentTask locale={locale} />
        <Roadmap locale={locale} />
        <ActivityFeed locale={locale} />
        <DevLogPreview locale={locale} />
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
