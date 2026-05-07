import { fileURLToPath } from "node:url";
import { connect, disconnect } from "../config/mongoConnection.js";
import { fetchViolations } from "./fetchViolations.js";
import { ingestViolations } from "./ingestViolations.js";

const DEFAULT_INTERVAL_MS = 60 * 1000; // 1 minute or use x hours 60 * 60 * 1000

// The first tick (T0) will ingest a violations.csv that already exists
// This is to backfill data until a point where the cron job can begin its work 
// Ticks after that T1+ will fetch and overwrite violations.csv and once again ingest new csv
export const tick = async (skipFetch: boolean) => {
  const label = skipFetch ? "seed tick (ingest only)" : "cron tick";
  const start = Date.now();
  console.log(`[cron] ${label} at ${new Date().toISOString()}`);
  try {
    if (!skipFetch) await fetchViolations();
    await ingestViolations();
    console.log(`[cron] ${label} done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  } catch (err) {
    // Log and continue — a single tick failure shouldn't kill the schedule.
    console.error(`[cron] ${label} failed:`, err instanceof Error ? err.message : err);
  }
};

// TODO implement a stop flag to stop and start the cron
export const startCron = async (intervalMs = DEFAULT_INTERVAL_MS) => {
  await tick(true);
  while (true) {
    console.log(`[cron] next tick in ${intervalMs / 1000}s`);
    await new Promise(resolve => setTimeout(resolve, intervalMs));
    await tick(false);
  }
};

// Set up connection since there's no caller dbconn
// Run as main with
// npx tsx data/cron/cron.ts
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await connect();
  try {
    await startCron();
  } finally {
    await disconnect();
  }
}
