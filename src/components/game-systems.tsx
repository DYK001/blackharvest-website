import { gameSystems } from "@/data/game-systems";
import { SectionHeader } from "@/components/section-header";

export function GameSystems() {
  return (
    <section className="section-block section-block--overview" id="project" aria-labelledby="project-heading">
      <div className="shell overview-layout">
        <div className="overview-intro">
          <SectionHeader headingId="project-heading" index="02" eyebrow="Game systems" title="Built for the weight of survival." />
          <p>
            BlackHarvest is a grounded third-person medieval open-world survival project where melee combat, exploration, equipment, survival pressure, and hostile infected meet as connected systems.
          </p>
        </div>
        <div className="game-systems game-systems--marketing">
          {gameSystems.map((system, index) => (
            <article className="game-system" key={system.id}>
              <div className="game-system__index">
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <small>Core system</small>
              </div>
              <div>
                <h3>{system.title}</h3>
                <p>{system.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
