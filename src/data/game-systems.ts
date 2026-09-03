import type { GameSystemOverview } from "@/types/project";

export const gameSystems: GameSystemOverview[] = [
  { id: "melee-combat", title: "Melee Combat", description: "Close-range combat built around grounded physical encounters." },
  { id: "survival", title: "Survival", description: "Interlocking systems that make preparation and resource decisions matter." },
  { id: "infected-ai", title: "Infected / Zombie AI", description: "Hostile infected enemies that shape combat and traversal." },
  { id: "equipment", title: "Equipment", description: "Loadout and equipment systems tied to survival and combat." },
  { id: "open-world", title: "Open World", description: "A medieval landscape built for exploration and systemic play." },
];
