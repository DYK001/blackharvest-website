import type { DevelopmentLogEntry } from "@/types/project";

export const developmentLogEntries: DevelopmentLogEntry[] = [
  {
    slug: "inventory-interaction-foundation",
    title: "Inventory & Interaction Foundation",
    summary: "The structured inventory and interaction foundation is complete and validated.",
    category: "Systems",
    relatedSystemIds: ["inventory-interaction"],
    status: "validated",
    validationState: "passed",
    validation: [
      { kind: "Automated Test", state: "passed", detail: "185 / 185 passed" },
    ],
    sections: [
      {
        heading: "Foundation",
        paragraphs: [
          "The completed milestone group covers the item foundation, inventory architecture, item transfer, interaction support, player inventory adaptation, equipment projection, and the inventory UI foundation.",
        ],
      },
      {
        heading: "Validation",
        paragraphs: [
          "The automated test suite completed 185 / 185 tests successfully. This milestone group is represented as validated.",
        ],
      },
    ],
  },
  {
    slug: "weapon-combat-foundation",
    title: "Weapon Combat Foundation",
    summary: "Horizontal and downward axe attacks are integrated, with presentation polish still in development.",
    category: "Player Combat",
    relatedSystemIds: ["player-combat"],
    status: "in-development",
    validationState: "passed",
    validation: [
      { kind: "Automated Test", state: "passed", detail: "7 / 7 weapon attack component tests passed" },
    ],
    sections: [
      {
        heading: "Attack foundation",
        paragraphs: [
          "Horizontal and downward axe attack inputs are integrated with upper-body attack presentation and their hit-window foundations.",
          "The axe combat Foley foundation is also complete.",
        ],
      },
      {
        heading: "Validation and remaining work",
        paragraphs: [
          "The automated attack-component suite completed 7 / 7 tests successfully. Start/end pose polish remains in development, and head look-at integration is planned.",
        ],
      },
    ],
  },
  {
    slug: "zombie-combat-rework",
    title: "Zombie Combat Rework",
    summary: "A slow, oppressive chase direction and deliberate two-attack combat cadence are established.",
    category: "Zombie Combat",
    relatedSystemIds: ["zombie-combat"],
    status: "in-development",
    validationState: "pending",
    sections: [
      {
        heading: "Combat direction",
        paragraphs: [
          "The rework establishes a slow chase baseline and an Attack 1 → Guard → Attack 2 cadence.",
          "Attack commitment stops movement and maintains enemy focus through the committed hit behavior.",
        ],
      },
      {
        heading: "Pressure and grab flow",
        paragraphs: [
          "The pressure counter and four-hit-to-grab flow foundations are complete. The grab state remains in development, while the execution flow is planned for future work.",
        ],
      },
    ],
  },
  {
    slug: "death-ragdoll-body-thud-validation",
    title: "Death Ragdoll / Body-Thud Validation",
    summary: "The integration is implemented, but a physics regression blocks final manual validation.",
    category: "Physics / Audio",
    relatedSystemIds: ["zombie-hit-death", "combat-audio"],
    status: "blocked",
    validationState: "blocked",
    validation: [
      { kind: "Implementation", state: "passed", detail: "Death-ragdoll, settle detection, and body-thud integration are implemented." },
      { kind: "Compile", state: "passed", detail: "The current implementation compiles." },
      { kind: "Automated Test", state: "not-applicable", detail: "No automated result is claimed for this physics behavior." },
      { kind: "Manual Validation", state: "blocked", detail: "Blocked by abnormal launch behavior during the ragdoll transition." },
    ],
    sections: [
      {
        heading: "Implemented flow",
        paragraphs: [
          "The death animation transitions into ragdoll, with settle detection and body-thud presentation implemented for the final death state.",
        ],
      },
      {
        heading: "Current regression",
        paragraphs: [
          "Manual testing exposed an abnormal launch during the ragdoll transition. The cause has not been confirmed, so the integration remains implemented rather than finally validated.",
        ],
      },
      {
        heading: "Next action",
        paragraphs: [
          "Resolve the ragdoll launch regression, then repeat manual death-settle and body-thud validation.",
        ],
      },
    ],
  },
];

export function getDevelopmentLogEntry(slug: string) {
  return developmentLogEntries.find((entry) => entry.slug === slug);
}
