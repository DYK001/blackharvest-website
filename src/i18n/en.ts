import type { UiDictionary } from "@/i18n/types";

export const en = {
  metadata: {
    homeTitle: "Black Harvest | Development",
    homeDescription:
      "The official development record for BlackHarvest, a grounded medieval open-world survival project.",
    socialTitle: "Black Harvest | Development",
    socialDescription:
      "Follow the published development state of BlackHarvest, a grounded medieval open-world survival project.",
    devlogNotFoundTitle: "Development Log Not Found",
  },
  languageSwitch: {
    label: "Language",
    english: "English",
    korean: "Korean",
  },
  navigation: {
    primaryLabel: "Primary navigation",
    footerLabel: "Footer navigation",
    homeLabel: "Black Harvest home",
    development: "Development",
    developmentShort: "Development",
    roadmap: "Roadmap",
    systems: "Systems",
    devlog: "Devlog",
    devlogShort: "Devlog",
    backToDevlog: "Development log",
    top: "Top",
  },
  hero: {
    skipLink: "Skip to development",
    status: "In development",
    subtitle: "Medieval Open-World Survival",
    description:
      "A grounded third-person survival project shaped by melee combat, hostile infected, and an unforgiving open world.",
    viewDevelopment: "View development",
    exploreProject: "Explore project",
    developmentRecord: "Development record · Vol. I",
    officialJournal: "Official project journal",
  },
  developmentFocus: {
    phase: "Active focus",
    eyebrow: "Active development focus",
    nextAction: "Next action",
    currentGate: "Current verification gate",
    overallProject: "Overall project",
    stateLabel: "Current development state",
  },
  fieldRecords: {
    eyebrow: "Field records",
    title: "From the world.",
    description: "Visual records from the development of BlackHarvest.",
  },
  gameSystems: {
    eyebrow: "Game systems",
    title: "Built for the weight of survival.",
    introduction:
      "BlackHarvest is a grounded third-person medieval open-world survival project where melee combat, exploration, equipment, survival pressure, and hostile infected meet as connected systems.",
    coreSystem: "Core system",
  },
  developmentSystems: {
    eyebrow: "Development systems",
    title: "A living ledger of systems.",
    description:
      "Published state and measured milestones for each development system.",
    unpublishedProgress: "Milestone progress is not published.",
    milestones: "milestones",
    milestonesProgress: (label, completed, total) =>
      `${label}: ${completed} of ${total} milestones complete`,
  },
  currentTask: {
    eyebrow: "Current task / Validation",
    title: "Proof before certainty.",
    description: "Each verification stage is reported independently.",
    record: "Current verification record",
    stagesLabel: "Validation stages",
  },
  roadmap: {
    eyebrow: "Roadmap",
    title: "The campaign of work ahead.",
    description:
      "A high-level sequence shaped by the current published state of each system.",
    campaign: "Campaign",
  },
  activity: {
    eyebrow: "Recent activity",
    title: "Dispatches from development.",
    description:
      "Verified results and known implementation states, ordered without invented dates.",
    validation: "Validation",
    readLog: "Read log",
    readLogLabel: "Read development log",
  },
  devlogPreview: {
    eyebrow: "Development log",
    title: "Field notes from the build.",
    description:
      "Implementation notes, validation evidence, and unresolved work.",
    related: "Related",
    readJournal: "Read journal",
  },
  devlogArticle: {
    journal: "Development journal",
    workState: "Work state",
    validation: "Validation",
    published: "Published",
    relatedSystems: "Related systems",
    evidence: "Evidence",
    validationRecord: "Validation record",
    validationStages: "Development log validation stages",
    developmentMedia: "Development media",
    comparison: "Before and after development comparison",
  },
  media: {
    unsupportedVideo: "Your browser does not support this BlackHarvest video clip.",
    credit: "Credit",
  },
  footer: {
    inDevelopment: "Currently in development.",
  },
  statusLabels: {
    "active-development": "Active Development",
    planned: "Planned",
    foundation: "Foundation",
    "in-development": "In Development",
    implemented: "Implemented",
    validation: "Validation",
    validated: "Validated",
    blocked: "Blocked",
    complete: "Complete",
    "on-hold": "On Hold",
  },
  validationLabels: {
    passed: "Pass",
    pending: "Pending",
    failed: "Failed",
    "not-applicable": "N/A",
    blocked: "Blocked",
  },
  validationKinds: {
    Implementation: "Implementation",
    Compile: "Compile",
    "Automated Test": "Automated Test",
    "Manual Validation": "Manual Validation",
  },
} satisfies UiDictionary;
