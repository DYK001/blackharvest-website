export type PublicStatus =
  | "active-development"
  | "planned"
  | "foundation"
  | "in-development"
  | "implemented"
  | "validation"
  | "validated"
  | "blocked"
  | "complete"
  | "on-hold";

export type MilestoneState =
  | "planned"
  | "in-development"
  | "implemented"
  | "validation"
  | "blocked"
  | "complete"
  | "on-hold";

export type ValidationState =
  | "passed"
  | "pending"
  | "failed"
  | "not-applicable"
  | "blocked";

export type ValidationKind =
  | "Implementation"
  | "Compile"
  | "Automated Test"
  | "Manual Validation";

export interface ValidationStep {
  kind: ValidationKind;
  state: ValidationState;
  detail?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  state: MilestoneState;
  validation?: ValidationStep[];
  publicNote?: string;
  updatedAt?: string;
}

export interface CurrentDevelopmentTask {
  title: string;
  status: PublicStatus;
  summary: string;
  nextAction: string;
  validation: ValidationStep[];
}

export interface ProjectStatus {
  name: string;
  projectType: string;
  overallStatus: PublicStatus;
  currentMajorFocus: string;
  currentTask: CurrentDevelopmentTask;
  lastUpdated?: string;
  progressNote: string;
}

export interface DevelopmentSystem {
  id: string;
  title: string;
  description: string;
  status: PublicStatus;
  progressMode: "milestones" | "status-only";
  progressNote?: string;
  publicNote?: string;
  milestones?: Milestone[];
  validation?: ValidationStep[];
  validationSummary?: string;
  lastUpdate?: string;
}

export type RoadmapItem =
  | {
      kind: "system";
      id: string;
      title: string;
      systemId: string;
    }
  | {
      kind: "standalone";
      id: string;
      title: string;
      description: string;
      status: PublicStatus;
      progressNote: string;
    };

export interface ActivityEntry {
  id: string;
  date?: string;
  orderLabel: string;
  title: string;
  description: string;
  category: string;
  status: PublicStatus;
  validation: ValidationState;
  validationDetail?: string;
  devlogSlug?: string;
}

export interface GameSystemOverview {
  id: string;
  title: string;
  description: string;
}

export interface DevelopmentLogSection {
  heading: string;
  paragraphs: string[];
}

export interface DevelopmentLogEntry {
  slug: string;
  title: string;
  summary: string;
  category: string;
  relatedSystemIds: string[];
  publishedAt?: string;
  status: PublicStatus;
  validationState: ValidationState;
  validation?: ValidationStep[];
  sections: DevelopmentLogSection[];
}
