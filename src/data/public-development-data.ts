import { activityEntries } from "@/data/activity";
import { developmentLogEntries } from "@/data/development-log";
import { developmentSystems } from "@/data/development-systems";
import { projectStatus } from "@/data/project-status";
import { assertPublicDevelopmentDataIntegrity } from "@/lib/validate-development-data";

export const publicDevelopmentData = {
  projectStatus,
  developmentSystems,
  activityEntries,
  developmentLogEntries,
};

assertPublicDevelopmentDataIntegrity(publicDevelopmentData);
