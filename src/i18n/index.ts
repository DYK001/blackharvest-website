import { activityEntries } from "@/data/activity";
import { developmentLogEntries } from "@/data/development-log";
import { developmentSystems } from "@/data/development-systems";
import { gameSystems } from "@/data/game-systems";
import { mediaManifest } from "@/data/media";
import { projectStatus } from "@/data/project-status";
import { roadmapItems } from "@/data/roadmap";
import { en } from "@/i18n/en";
import { ko, koContent } from "@/i18n/ko";
import type { Locale } from "@/i18n/types";
import type { MediaAsset } from "@/types/media";
import type { ValidationKind, ValidationStep } from "@/types/project";

export type { Locale } from "@/i18n/types";

export const locales = ["en", "ko"] as const;
export const defaultLocale: Locale = "en";

export function getDictionary(locale: Locale) {
  return locale === "ko" ? ko : en;
}

export function localizedPath(locale: Locale, path: string) {
  if (locale === "en") return path;
  if (path === "/") return "/ko";
  if (path.startsWith("/#")) return `/ko${path.slice(1)}`;
  return `/ko${path}`;
}

export function getLanguageAlternates(path: string) {
  return {
    en: localizedPath("en", path),
    ko: localizedPath("ko", path),
  };
}

function localizeValidation(
  validation: readonly ValidationStep[] | undefined,
  details: Partial<Record<ValidationKind, string>> | undefined,
) {
  return validation?.map((step) => ({
    ...step,
    detail: details?.[step.kind] ?? step.detail,
  }));
}

export function getLocalizedProjectStatus(locale: Locale) {
  if (locale === "en") return projectStatus;

  const translation = koContent.projectStatus;
  return {
    ...projectStatus,
    currentMajorFocus: translation.currentMajorFocus,
    progressNote: translation.progressNote,
    currentTask: {
      ...projectStatus.currentTask,
      ...translation.currentTask,
      validation: localizeValidation(
        projectStatus.currentTask.validation,
        translation.currentTask.validationDetails,
      ) ?? [],
    },
  };
}

export function getLocalizedGameSystems(locale: Locale) {
  if (locale === "en") return gameSystems;

  return gameSystems.map((system) => ({
    ...system,
    title: koContent.gameSystems[system.id]?.title ?? system.title,
    description: koContent.gameSystems[system.id]?.description ?? system.description,
  }));
}

export function getLocalizedDevelopmentSystems(locale: Locale) {
  if (locale === "en") return developmentSystems;

  return developmentSystems.map((system) => {
    const translation = koContent.developmentSystems[system.id];
    return {
      ...system,
      title: translation?.title ?? system.title,
      description: translation?.description ?? system.description,
      publicNote: translation?.publicNote ?? system.publicNote,
      progressNote: translation?.progressNote ?? system.progressNote,
      validationSummary: translation?.validationSummary ?? system.validationSummary,
      validation: localizeValidation(system.validation, translation?.validationDetails),
      milestones: system.milestones?.map((milestone) => ({
        ...milestone,
        title: translation?.milestones[milestone.id]?.title ?? milestone.title,
        publicNote:
          translation?.milestones[milestone.id]?.publicNote ?? milestone.publicNote,
      })),
    };
  });
}

export function getLocalizedDevelopmentSystem(locale: Locale, id: string) {
  return getLocalizedDevelopmentSystems(locale).find((system) => system.id === id);
}

export function getLocalizedRoadmap(locale: Locale) {
  if (locale === "en") return roadmapItems;

  return roadmapItems.map((item) => {
    const translation = koContent.roadmap[item.id];
    return {
      ...item,
      title: translation?.title ?? item.title,
      ...(item.kind === "standalone"
        ? {
            description: translation?.description ?? item.description,
            progressNote: translation?.progressNote ?? item.progressNote,
          }
        : {}),
    };
  });
}

export function getLocalizedActivities(locale: Locale) {
  if (locale === "en") return activityEntries;

  return activityEntries.map((entry) => ({
    ...entry,
    ...koContent.activities[entry.id],
  }));
}

export function getLocalizedDevelopmentLogs(locale: Locale) {
  if (locale === "en") return developmentLogEntries;

  return developmentLogEntries.map((entry) => {
    const translation = koContent.devlogs[entry.slug];
    return {
      ...entry,
      title: translation?.title ?? entry.title,
      summary: translation?.summary ?? entry.summary,
      category: translation?.category ?? entry.category,
      validation: localizeValidation(entry.validation, translation?.validationDetails),
      sections: translation?.sections ?? entry.sections,
    };
  });
}

export function getLocalizedDevelopmentLog(locale: Locale, slug: string) {
  return getLocalizedDevelopmentLogs(locale).find((entry) => entry.slug === slug);
}

export function getLocalizedMediaAsset(locale: Locale, asset: MediaAsset) {
  if (locale === "en") return asset;

  const translation = koContent.media[asset.id];
  return {
    ...asset,
    alt: translation?.alt ?? asset.alt,
    caption: translation?.caption ?? asset.caption,
  };
}

export function getMediaLabel(locale: Locale, asset: MediaAsset) {
  if (locale === "ko") return koContent.media[asset.id]?.label;

  return asset.category?.replace(/(^|-)([a-z])/g, (_, separator, letter: string) =>
    `${separator === "-" ? " " : ""}${letter.toUpperCase()}`,
  );
}

export function getLocalizedHomepageMedia(locale: Locale) {
  return mediaManifest.homepage.assetIds
    .map((id) => mediaManifest.assets.find((asset) => asset.id === id && asset.public))
    .filter((asset): asset is MediaAsset => Boolean(asset))
    .map((asset) => getLocalizedMediaAsset(locale, asset));
}
