import { runCli } from "./src/cli";

runCli(process.argv.slice(2)).catch((error: unknown) => {
  console.error("[ynab-sync] Unhandled error", error);
  process.exit(1);
});
