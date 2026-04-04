import type { BankAccount, BankTransaction } from "../types";

interface ParseMacquarieCsvFileOptions {
  accountName: string;
  filePath: string;
  includeOnlyAfter: Date;
}

const monthNumberByShortNameValue: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let currentValue = "";
  let isInQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const isEscapedQuote = line[i + 1] === '"';
      if (isEscapedQuote) {
        currentValue += '"';
        i += 1;
        continue;
      }

      isInQuotes = !isInQuotes;
      continue;
    }

    if (char === "," && !isInQuotes) {
      result.push(currentValue.trim());
      currentValue = "";
      continue;
    }

    currentValue += char;
  }

  result.push(currentValue.trim());
  return result;
};

const parseDateToIso = (value: string): string => {
  const [day, monthShortName, year] = value.trim().split(/\s+/);

  if (!monthShortName) {
    throw new Error(`Invalid Macquarie transaction date '${value}'.`);
  }

  const month = monthNumberByShortNameValue[monthShortName];

  if (!day || !month || !year) {
    throw new Error(`Invalid Macquarie transaction date '${value}'.`);
  }

  return `${year}-${month}-${day.padStart(2, "0")}`;
};

const parseNumber = (value: string): number => {
  const cleaned = value.replaceAll("$", "").replaceAll(",", "").trim();
  return cleaned ? Number.parseFloat(cleaned) : 0;
};

const isAfterDate = (dateValue: string, threshold: Date): boolean => {
  const normalizedDate = new Date(`${dateValue}T00:00:00.000Z`);
  return normalizedDate.getTime() > threshold.getTime();
};

const getFieldValue = (record: Record<string, string>, key: string): string => {
  return record[key] ?? "";
};

export const parseMacquarieCsvFile = async ({
  accountName,
  filePath,
  includeOnlyAfter,
}: ParseMacquarieCsvFileOptions): Promise<BankAccount> => {
  const file = Bun.file(filePath);

  if (!(await file.exists())) {
    throw new Error(`CSV file not found: ${filePath}`);
  }

  const rawContent = await file.text();
  const lines = rawContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error(`CSV file has no transaction rows: ${filePath}`);
  }

  const headerLine = lines[0];
  if (!headerLine) {
    throw new Error(`CSV file has no header row: ${filePath}`);
  }

  const headers = parseCsvLine(headerLine);
  const transactions: BankTransaction[] = [];
  let latestBalance = 0;

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const currentLine = lines[lineIndex];
    if (!currentLine) {
      continue;
    }

    const values = parseCsvLine(currentLine);
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    const transactionDate = parseDateToIso(getFieldValue(record, "Transaction Date"));

    if (!isAfterDate(transactionDate, includeOnlyAfter)) {
      continue;
    }

    const debit = parseNumber(getFieldValue(record, "Debit"));
    const credit = parseNumber(getFieldValue(record, "Credit"));
    latestBalance = parseNumber(getFieldValue(record, "Balance"));

    transactions.push({
      amount: debit > 0 ? -debit : credit,
      category: getFieldValue(record, "Category"),
      date: transactionDate,
      description: getFieldValue(record, "Details"),
    });
  }

  return {
    name: accountName,
    balance: latestBalance,
    transactions,
  };
};
