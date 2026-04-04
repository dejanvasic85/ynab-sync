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
  return {
    apply: args.includes("--apply"),
  };
};

export const loadLocalConfig = async (filePath = defaultLocalConfigPathValue): Promise<LocalConfig> => {
  const configFile = Bun.file(filePath);

  if (!(await configFile.exists())) {
    throw new Error(`Missing local config file at ${filePath}. Copy config/local.example.json to ${filePath}.`);
  }

  const rawValue = await configFile.json();
  return parseLocalConfig(rawValue);
};
