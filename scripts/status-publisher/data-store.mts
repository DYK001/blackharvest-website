import { readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

import type {
  ActivityEntry,
  DevelopmentLogEntry,
  DevelopmentSystem,
  ProjectStatus,
} from "../../src/types/project.ts";
import type { PublicDevelopmentData } from "../../src/lib/validate-development-data.ts";

export type DataFileKey = keyof PublicDevelopmentData;

interface DataFileDefinition {
  relativePath: string;
  exportName: string;
}

export const dataFiles: Record<DataFileKey, DataFileDefinition> = {
  projectStatus: {
    relativePath: "src/data/project-status.ts",
    exportName: "projectStatus",
  },
  developmentSystems: {
    relativePath: "src/data/development-systems.ts",
    exportName: "developmentSystems",
  },
  activityEntries: {
    relativePath: "src/data/activity.ts",
    exportName: "activityEntries",
  },
  developmentLogEntries: {
    relativePath: "src/data/development-log.ts",
    exportName: "developmentLogEntries",
  },
};

const dataFileKeys = Object.keys(dataFiles) as DataFileKey[];

function propertyNameText(name: ts.PropertyName) {
  if (
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNumericLiteral(name)
  ) {
    return name.text;
  }

  throw new Error("Computed property names are not allowed in status data");
}

function readLiteral(node: ts.Expression): unknown {
  if (ts.isParenthesizedExpression(node)) return readLiteral(node.expression);
  if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node)) {
    return readLiteral(node.expression);
  }
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;

  if (ts.isPrefixUnaryExpression(node)) {
    const value = readLiteral(node.operand);
    if (typeof value !== "number") {
      throw new Error("Only numeric unary expressions are allowed in status data");
    }
    if (node.operator === ts.SyntaxKind.MinusToken) return -value;
    if (node.operator === ts.SyntaxKind.PlusToken) return value;
  }

  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((element) => {
      if (ts.isSpreadElement(element)) {
        throw new Error("Spread syntax is not allowed in status data");
      }
      return readLiteral(element);
    });
  }

  if (ts.isObjectLiteralExpression(node)) {
    const value: Record<string, unknown> = {};
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) {
        throw new Error(
          "Only explicit property assignments are allowed in status data",
        );
      }
      value[propertyNameText(property.name)] = readLiteral(property.initializer);
    }
    return value;
  }

  throw new Error(
    `Only inert object, array, string, number, boolean, and null literals are allowed in status data (found ${ts.SyntaxKind[node.kind]})`,
  );
}

function parseExportedLiteral(
  sourceText: string,
  sourceName: string,
  exportName: string,
) {
  const source = ts.createSourceFile(
    sourceName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const parseDiagnostics = (
    source as ts.SourceFile & { parseDiagnostics?: readonly ts.Diagnostic[] }
  ).parseDiagnostics;
  if (parseDiagnostics && parseDiagnostics.length > 0) {
    throw new Error(`Status data contains invalid TypeScript: ${sourceName}`);
  }

  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === exportName &&
        declaration.initializer
      ) {
        return readLiteral(declaration.initializer);
      }
    }
  }

  throw new Error(
    `Could not find the ${exportName} literal in ${path.basename(sourceName)}`,
  );
}

async function readExportedLiteral(
  absolutePath: string,
  exportName: string,
): Promise<unknown> {
  const sourceText = await readFile(absolutePath, "utf8");
  return parseExportedLiteral(sourceText, absolutePath, exportName);
}

export function readDataValueFromSource(
  key: DataFileKey,
  sourceText: string,
  sourceName = dataFiles[key].relativePath,
) {
  return parseExportedLiteral(sourceText, sourceName, dataFiles[key].exportName);
}

export async function readPublicDevelopmentData(
  repositoryRoot: string,
): Promise<PublicDevelopmentData> {
  const values = await Promise.all(
    dataFileKeys.map(async (key) => {
      const definition = dataFiles[key];
      const value = await readExportedLiteral(
        path.join(repositoryRoot, definition.relativePath),
        definition.exportName,
      );
      return [key, value] as const;
    }),
  );

  return Object.fromEntries(values) as unknown as PublicDevelopmentData;
}

function serialize(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function renderProjectStatus(projectStatus: ProjectStatus) {
  return `import type { ProjectStatus } from "@/types/project";\n\nexport const projectStatus: ProjectStatus = ${serialize(projectStatus)};\n`;
}

function renderDevelopmentSystems(developmentSystems: DevelopmentSystem[]) {
  return `import { assertDevelopmentDataIntegrity } from "@/lib/validate-development-data";\nimport type { DevelopmentSystem } from "@/types/project";\n\nexport const developmentSystems: DevelopmentSystem[] = ${serialize(developmentSystems)};\n\nassertDevelopmentDataIntegrity(developmentSystems);\n\nexport function getDevelopmentSystem(id: string) {\n  return developmentSystems.find((system) => system.id === id);\n}\n`;
}

function renderActivityEntries(activityEntries: ActivityEntry[]) {
  return `import type { ActivityEntry } from "@/types/project";\n\nexport const activityEntries: ActivityEntry[] = ${serialize(activityEntries)};\n`;
}

function renderDevelopmentLogEntries(
  developmentLogEntries: DevelopmentLogEntry[],
) {
  return `import type { DevelopmentLogEntry } from "@/types/project";\n\nexport const developmentLogEntries: DevelopmentLogEntry[] = ${serialize(developmentLogEntries)};\n\nexport function getDevelopmentLogEntry(slug: string) {\n  return developmentLogEntries.find((entry) => entry.slug === slug);\n}\n`;
}

export function renderDataFile(
  key: DataFileKey,
  data: PublicDevelopmentData,
) {
  if (key === "projectStatus") return renderProjectStatus(data.projectStatus);
  if (key === "developmentSystems") {
    return renderDevelopmentSystems(data.developmentSystems);
  }
  if (key === "activityEntries") {
    return renderActivityEntries(data.activityEntries);
  }
  return renderDevelopmentLogEntries(data.developmentLogEntries);
}

export function clonePublicDevelopmentData(
  data: PublicDevelopmentData,
): PublicDevelopmentData {
  return structuredClone(data);
}
