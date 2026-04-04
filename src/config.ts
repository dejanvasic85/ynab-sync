import { z } from "zod";

import type { CliOptions, LocalConfig } from "./types";

const accountConfigSchemaValue = z.object({
  fileName: z.string().min(1),
  ynabAccountId: z.string().min(1),
  negativeOnly: z.boolean(),
});

const localConfigSchemaValue = z.object({
  ynabApiKey: z.string().min(1),
  ynabBudgetId: z.string().min(1),
  accounts: z.array(accountConfigSchemaValue).min(1),
  memosToIgnore: z.array(z.string()),
  numberOfDaysToFetch: z.number().int().positive(),
  includeOnlyAfterDays: z.number().int().positive(),
});

export const defaultLocalConfigPathValue = "config/local.json";

export const parseLocalConfig = (rawValue: unknown): LocalConfig => {
  return localConfigSchemaValue.parse(rawValue);
};

export const parseCliOptions = (args: string[]): CliOptions => {
  const command = args[0];

  if (command !== "csv") {
    throw new Error("Usage: bun run index.ts csv [--data-dir <path>] [--dry-run]");
  }

  const commandArgs = args.slice(1);
  const dataDirIndex = commandArgs.findIndex((arg) => arg === "--data-dir");
  const dataDir = dataDirIndex >= 0 ? commandArgs[dataDirIndex + 1] : undefined;

  if (dataDirIndex >= 0 && (!dataDir || dataDir.startsWith("--"))) {
    throw new Error("--data-dir requires a path value.");
  }

  return {
    command,
    apply: !commandArgs.includes("--dry-run"),
    dataDir: dataDir ?? "config",
  };
};

export const loadLocalConfig = async (filePath = defaultLocalConfigPathValue): Promise<LocalConfig> => {
  const configFile = Bun.file(filePath);

  if (!(await configFile.exists())) {
    throw new Error(`Missing local config file at ${filePath}. Create it using the README example config.`);
  }

  const rawValue = await configFile.json();
  return parseLocalConfig(rawValue);
};
