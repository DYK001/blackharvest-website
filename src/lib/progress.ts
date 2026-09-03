import type { DevelopmentSystem, Milestone } from "@/types/project";

export interface MilestoneProgress {
  completed: number;
  total: number;
  percentage: number;
}

export function calculateMilestoneProgress(
  milestones: readonly Milestone[],
): MilestoneProgress | null {
  if (milestones.length === 0) return null;

  const completed = milestones.filter(
    (milestone) => milestone.state === "complete",
  ).length;

  return {
    completed,
    total: milestones.length,
    percentage: Math.round((completed / milestones.length) * 100),
  };
}

export function getSystemProgress(
  system: DevelopmentSystem,
): MilestoneProgress | null {
  if (system.progressMode !== "milestones" || !system.milestones) return null;
  return calculateMilestoneProgress(system.milestones);
}
