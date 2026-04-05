import { parseMacquarieCsvFile } from "./macquarieCsv";

export const bankParserMapValue = Object.freeze({
  macquarie: parseMacquarieCsvFile,
});

export type BankParserName = keyof typeof bankParserMapValue;

export const bankParserNamesValue = Object.freeze(Object.keys(bankParserMapValue) as BankParserName[]);

export const isBankParserName = (value: string): value is BankParserName => {
  return value in bankParserMapValue;
};

export const getBankParser = (parserName: string) => {
  if (!isBankParserName(parserName)) {
    throw new Error(`Unsupported parser '${parserName}'. Supported parsers: ${bankParserNamesValue.join(", ")}.`);
  }

  return bankParserMapValue[parserName];
};
