import type { Milestone } from "@/types/project";
import { calculateMilestoneProgress } from "@/lib/progress";
import { getDictionary, type Locale } from "@/i18n";

export function MilestoneTrack({
  label,
  milestones,
  compact = false,
  locale,
}: {
  label: string;
  milestones: readonly Milestone[];
  compact?: boolean;
  locale: Locale;
}) {
  const progress = calculateMilestoneProgress(milestones);
  const dictionary = getDictionary(locale);
  if (!progress) return null;

  return (
    <div className="milestone-track" data-compact={compact || undefined}>
      <div className="milestone-track__summary">
        <span>{progress.completed} / {progress.total} {dictionary.developmentSystems.milestones}</span>
        <strong>{progress.percentage}%</strong>
      </div>
      <div
        className="milestone-track__segments"
        role="progressbar"
        aria-label={dictionary.developmentSystems.milestonesProgress(label, progress.completed, progress.total)}
        aria-valuemin={0}
        aria-valuemax={progress.total}
        aria-valuenow={progress.completed}
      >
        {milestones.map((milestone) => (
          <span
            key={milestone.id}
            data-state={milestone.state}
            title={`${milestone.title}: ${dictionary.statusLabels[milestone.state]}`}
          />
        ))}
      </div>
    </div>
  );
}
