import type {
  PublicStatus,
  ValidationKind,
  ValidationState,
} from "@/types/project";

export type Locale = "en" | "ko";

export interface UiDictionary {
  metadata: {
    homeTitle: string;
    homeDescription: string;
    socialTitle: string;
    socialDescription: string;
    devlogNotFoundTitle: string;
  };
  languageSwitch: {
    label: string;
    english: string;
    korean: string;
  };
  navigation: {
    primaryLabel: string;
    footerLabel: string;
    homeLabel: string;
    development: string;
    developmentShort: string;
    roadmap: string;
    systems: string;
    devlog: string;
    devlogShort: string;
    backToDevlog: string;
    top: string;
  };
  hero: {
    skipLink: string;
    status: string;
    subtitle: string;
    description: string;
    viewDevelopment: string;
    exploreProject: string;
    developmentRecord: string;
    officialJournal: string;
  };
  developmentFocus: {
    phase: string;
    eyebrow: string;
    nextAction: string;
    currentGate: string;
    overallProject: string;
    stateLabel: string;
  };
  fieldRecords: {
    eyebrow: string;
    title: string;
    description: string;
  };
  gameSystems: {
    eyebrow: string;
    title: string;
    introduction: string;
    coreSystem: string;
  };
  developmentSystems: {
    eyebrow: string;
    title: string;
    description: string;
    unpublishedProgress: string;
    milestones: string;
    milestonesProgress: (label: string, completed: number, total: number) => string;
  };
  currentTask: {
    eyebrow: string;
    title: string;
    description: string;
    record: string;
    stagesLabel: string;
  };
  roadmap: {
    eyebrow: string;
    title: string;
    description: string;
    campaign: string;
  };
  activity: {
    eyebrow: string;
    title: string;
    description: string;
    validation: string;
    readLog: string;
    readLogLabel: string;
  };
  devlogPreview: {
    eyebrow: string;
    title: string;
    description: string;
    related: string;
    readJournal: string;
  };
  devlogArticle: {
    journal: string;
    workState: string;
    validation: string;
    published: string;
    relatedSystems: string;
    evidence: string;
    validationRecord: string;
    validationStages: string;
    developmentMedia: string;
    comparison: string;
  };
  media: {
    unsupportedVideo: string;
    credit: string;
  };
  footer: {
    inDevelopment: string;
  };
  statusLabels: Record<PublicStatus, string>;
  validationLabels: Record<ValidationState, string>;
  validationKinds: Record<ValidationKind, string>;
}

export interface ProjectStatusTranslation {
  currentMajorFocus: string;
  progressNote: string;
  currentTask: {
    title: string;
    summary: string;
    nextAction: string;
    validationDetails: Partial<Record<ValidationKind, string>>;
  };
}

export interface DevelopmentSystemTranslation {
  title: string;
  description: string;
  publicNote?: string;
  progressNote?: string;
  validationSummary?: string;
  validationDetails?: Partial<Record<ValidationKind, string>>;
  milestones: Record<
    string,
    {
      title: string;
      publicNote?: string;
    }
  >;
}

export interface ActivityTranslation {
  orderLabel: string;
  title: string;
  description: string;
  category: string;
  validationDetail?: string;
}

export interface DevelopmentLogTranslation {
  title: string;
  summary: string;
  category: string;
  validationDetails: Partial<Record<ValidationKind, string>>;
  sections: Array<{
    heading: string;
    paragraphs: string[];
  }>;
}

export interface LocalizedContent {
  projectStatus: ProjectStatusTranslation;
  gameSystems: Record<string, { title: string; description: string }>;
  developmentSystems: Record<string, DevelopmentSystemTranslation>;
  roadmap: Record<
    string,
    {
      title: string;
      description?: string;
      progressNote?: string;
    }
  >;
  activities: Record<string, ActivityTranslation>;
  devlogs: Record<string, DevelopmentLogTranslation>;
  media: Record<
    string,
    {
      alt: string;
      label: string;
      caption?: string;
    }
  >;
}
