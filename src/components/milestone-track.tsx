import type { Milestone } from "@/types/project";
import { calculateMilestoneProgress } from "@/lib/progress";

export function MilestoneTrack({
  label,
  milestones,
  compact = false,
}: {
  label: string;
  milestones: readonly Milestone[];
  compact?: boolean;
}) {
  const progress = calculateMilestoneProgress(milestones);
  if (!progress) return null;

  return (
    <div className="milestone-track" data-compact={compact || undefined}>
      <div className="milestone-track__summary">
        <span>{progress.completed} / {progress.total} milestones</span>
        <strong>{progress.percentage}%</strong>
      </div>
      <div
        className="milestone-track__segments"
        role="progressbar"
        aria-label={`${label}: ${progress.completed} of ${progress.total} milestones complete`}
        aria-valuemin={0}
        aria-valuemax={progress.total}
        aria-valuenow={progress.completed}
      >
        {milestones.map((milestone) => (
          <span
            key={milestone.id}
            data-state={milestone.state}
            title={`${milestone.title}: ${milestone.state}`}
          />
        ))}
      </div>
    </div>
  );
}
