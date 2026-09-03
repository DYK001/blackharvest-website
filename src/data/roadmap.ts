import type { RoadmapItem } from "@/types/project";

export const roadmapItems: RoadmapItem[] = [
  {
    kind: "standalone",
    id: "foundation",
    title: "Foundation",
    description: "Shared foundations supporting the wider project.",
    status: "foundation",
    progressNote: "A measurable milestone set has not been published.",
  },
  { kind: "system", id: "inventory-interaction", title: "Inventory & Interaction", systemId: "inventory-interaction" },
  { kind: "system", id: "equipment", title: "Equipment", systemId: "equipment" },
  { kind: "system", id: "player-combat", title: "Player Combat", systemId: "player-combat" },
  { kind: "system", id: "zombie-combat", title: "Zombie Combat", systemId: "zombie-combat" },
  { kind: "system", id: "combat-audio", title: "Combat Audio / Foley", systemId: "combat-audio" },
  { kind: "system", id: "survival", title: "Survival", systemId: "survival" },
  { kind: "system", id: "world", title: "World", systemId: "world" },
  { kind: "system", id: "crafting", title: "Crafting", systemId: "crafting" },
  { kind: "system", id: "ui-ux", title: "UI / UX", systemId: "ui-ux" },
  {
    kind: "standalone",
    id: "polish",
    title: "Polish",
    description: "Project-wide refinement after core implementation and validation.",
    status: "planned",
    progressNote: "A measurable milestone set has not been published.",
  },
];
