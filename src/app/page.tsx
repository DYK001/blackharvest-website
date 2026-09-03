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

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <DevelopmentStatus />
        <MediaShowcase />
        <GameSystems />
        <SystemStatusGrid />
        <CurrentTask />
        <Roadmap />
        <ActivityFeed />
        <DevLogPreview />
      </main>
      <SiteFooter />
    </>
  );
}
