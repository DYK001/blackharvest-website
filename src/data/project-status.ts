import type { ProjectStatus } from "@/types/project";

export const projectStatus: ProjectStatus = {
  name: "BlackHarvest",
  projectType: "Third-person medieval open-world survival project",
  overallStatus: "active-development",
  currentMajorFocus: "Zombie Combat / Death Ragdoll Validation",
  progressNote: "No project-wide completion percentage is published.",
  currentTask: {
    title: "Zombie Death Ragdoll Validation",
    status: "blocked",
    summary:
      "Death ragdoll and body-thud integration are implemented, but final manual validation is blocked by a physics regression that can launch the zombie during the ragdoll transition.",
    nextAction:
      "Resolve ragdoll launch regression, then repeat manual death-settle/body-thud validation.",
    validation: [
      { kind: "Implementation", state: "passed", detail: "Death ragdoll and body-thud integration are implemented." },
      { kind: "Compile", state: "passed", detail: "The current implementation compiles." },
      { kind: "Automated Test", state: "not-applicable", detail: "No automated result is claimed for this physics behavior." },
      { kind: "Manual Validation", state: "blocked", detail: "Blocked by the ragdoll launch regression." },
    ],
  },
};
