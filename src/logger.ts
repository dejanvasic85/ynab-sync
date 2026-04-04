const sensitiveKeyPatternsValue = [/key/i, /token/i, /secret/i, /authorization/i];

const redactValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(redactValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => {
        const isSensitive = sensitiveKeyPatternsValue.some((pattern) => pattern.test(key));
        return [key, isSensitive ? "[REDACTED]" : redactValue(nestedValue)];
      }),
    );
  }

  return value;
};

export const createLogger = (context: string) => {
  return {
    info: (message: string, meta?: unknown): void => {
      if (meta === undefined) {
        console.log(`[${context}] ${message}`);
        return;
      }

      console.log(`[${context}] ${message}`, redactValue(meta));
    },
    error: (message: string, meta?: unknown): void => {
      if (meta === undefined) {
        console.error(`[${context}] ${message}`);
        return;
      }

      console.error(`[${context}] ${message}`, redactValue(meta));
    },
  };
};
