import { SectionHeader } from "@/components/section-header";
import { getDictionary, getLocalizedGameSystems, type Locale } from "@/i18n";

export function GameSystems({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const gameSystems = getLocalizedGameSystems(locale);
  return (
    <section className="section-block section-block--overview" id="project" aria-labelledby="project-heading">
      <div className="shell overview-layout">
        <div className="overview-intro">
          <SectionHeader headingId="project-heading" index="02" eyebrow={dictionary.gameSystems.eyebrow} title={dictionary.gameSystems.title} />
          <p>{dictionary.gameSystems.introduction}</p>
        </div>
        <div className="game-systems game-systems--marketing">
          {gameSystems.map((system, index) => (
            <article className="game-system" key={system.id}>
              <div className="game-system__index" data-reveal="fade">
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <small>{dictionary.gameSystems.coreSystem}</small>
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
