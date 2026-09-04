import { activityEntries } from "@/data/activity";
import { developmentLogEntries } from "@/data/development-log";
import { developmentSystems } from "@/data/development-systems";
import { gameSystems } from "@/data/game-systems";
import { mediaManifest } from "@/data/media";
import { projectStatus } from "@/data/project-status";
import { roadmapItems } from "@/data/roadmap";
import { koContent } from "@/i18n/ko";

function compareIds(label: string, canonical: string[], translated: string[], errors: string[]) {
  const canonicalSet = new Set(canonical);
  const translatedSet = new Set(translated);

  for (const id of canonical) {
    if (!translatedSet.has(id)) errors.push(`${label}: missing Korean translation for "${id}".`);
  }
  for (const id of translated) {
    if (!canonicalSet.has(id)) errors.push(`${label}: unknown Korean translation key "${id}".`);
  }
}

function assertText(label: string, value: string | undefined, errors: string[]) {
  if (!value?.trim()) errors.push(`${label}: translated text must not be empty.`);
}

export function getKoreanCoverageErrors() {
  const errors: string[] = [];

  compareIds("Game systems", gameSystems.map(({ id }) => id), Object.keys(koContent.gameSystems), errors);
  compareIds("Development systems", developmentSystems.map(({ id }) => id), Object.keys(koContent.developmentSystems), errors);
  compareIds("Roadmap", roadmapItems.map(({ id }) => id), Object.keys(koContent.roadmap), errors);
  compareIds("Activity", activityEntries.map(({ id }) => id), Object.keys(koContent.activities), errors);
  compareIds("Devlogs", developmentLogEntries.map(({ slug }) => slug), Object.keys(koContent.devlogs), errors);
  compareIds("Media", mediaManifest.assets.filter(({ public: isPublic }) => isPublic).map(({ id }) => id), Object.keys(koContent.media), errors);

  assertText("Project status current focus", koContent.projectStatus.currentMajorFocus, errors);
  assertText("Project status progress note", koContent.projectStatus.progressNote, errors);
  assertText("Current task title", koContent.projectStatus.currentTask.title, errors);
  assertText("Current task summary", koContent.projectStatus.currentTask.summary, errors);
  assertText("Current task next action", koContent.projectStatus.currentTask.nextAction, errors);
  for (const step of projectStatus.currentTask.validation) {
    assertText(
      `Current task ${step.kind} detail`,
      koContent.projectStatus.currentTask.validationDetails[step.kind],
      errors,
    );
  }

  for (const system of gameSystems) {
    const translation = koContent.gameSystems[system.id];
    if (!translation) continue;
    assertText(`Game system ${system.id} title`, translation.title, errors);
    assertText(`Game system ${system.id} description`, translation.description, errors);
  }

  for (const system of developmentSystems) {
    const translation = koContent.developmentSystems[system.id];
    if (!translation) continue;
    assertText(`Development system ${system.id} title`, translation.title, errors);
    assertText(`Development system ${system.id} description`, translation.description, errors);
    compareIds(
      `Development system ${system.id} milestones`,
      system.milestones?.map(({ id }) => id) ?? [],
      Object.keys(translation.milestones),
      errors,
    );
    for (const step of system.validation ?? []) {
      assertText(
        `Development system ${system.id} ${step.kind} detail`,
        translation.validationDetails?.[step.kind],
        errors,
      );
    }
  }

  for (const item of roadmapItems) {
    const translation = koContent.roadmap[item.id];
    if (!translation) continue;
    assertText(`Roadmap ${item.id} title`, translation.title, errors);
    if (item.kind === "standalone") {
      assertText(`Roadmap ${item.id} description`, translation.description, errors);
      assertText(`Roadmap ${item.id} progress note`, translation.progressNote, errors);
    }
  }

  for (const entry of activityEntries) {
    const translation = koContent.activities[entry.id];
    if (!translation) continue;
    assertText(`Activity ${entry.id} order label`, translation.orderLabel, errors);
    assertText(`Activity ${entry.id} title`, translation.title, errors);
    assertText(`Activity ${entry.id} description`, translation.description, errors);
    assertText(`Activity ${entry.id} category`, translation.category, errors);
    if (entry.validationDetail) {
      assertText(`Activity ${entry.id} validation detail`, translation.validationDetail, errors);
    }
  }

  for (const entry of developmentLogEntries) {
    const translation = koContent.devlogs[entry.slug];
    if (!translation) continue;
    assertText(`Devlog ${entry.slug} title`, translation.title, errors);
    assertText(`Devlog ${entry.slug} summary`, translation.summary, errors);
    assertText(`Devlog ${entry.slug} category`, translation.category, errors);
    if (translation.sections.length !== entry.sections.length) {
      errors.push(`Devlog ${entry.slug}: expected ${entry.sections.length} translated sections, received ${translation.sections.length}.`);
    }
    translation.sections.forEach((section, index) => {
      assertText(`Devlog ${entry.slug} section ${index + 1} heading`, section.heading, errors);
      if (section.paragraphs.length !== entry.sections[index]?.paragraphs.length) {
        errors.push(`Devlog ${entry.slug} section ${index + 1}: paragraph count does not match English source.`);
      }
      section.paragraphs.forEach((paragraph, paragraphIndex) =>
        assertText(`Devlog ${entry.slug} section ${index + 1} paragraph ${paragraphIndex + 1}`, paragraph, errors),
      );
    });
    for (const step of entry.validation ?? []) {
      assertText(
        `Devlog ${entry.slug} ${step.kind} detail`,
        translation.validationDetails[step.kind],
        errors,
      );
    }
  }

  for (const asset of mediaManifest.assets.filter(({ public: isPublic }) => isPublic)) {
    const translation = koContent.media[asset.id];
    if (!translation) continue;
    assertText(`Media ${asset.id} alt`, translation.alt, errors);
    assertText(`Media ${asset.id} label`, translation.label, errors);
    if (asset.caption) assertText(`Media ${asset.id} caption`, translation.caption, errors);
  }

  return errors;
}
