import { fileURLToPath } from 'node:url';
import { connect, disconnect } from '../config/mongoConnection.js';
import { ViolationModel } from '../models/Violation.js';
import { fetchViolations } from './fetchViolations.js';
import { ingestViolations } from './ingestViolations.js';

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;
// Simple heuristic to prevent notifications on the first fetch+ingest if db was not backfilled
// If violation rows < 100k, treat as cold start and suppress the first tick's notifications
// so we don't spam subscribers for historical rows
const SEED_THRESHOLD = 100_000;

// The first tick (T0) will ingest a violations.csv that already exists
// This is to backfill data until a point where the cron job can begin its work
// Ticks after that T1+ will fetch and overwrite violations.csv and once again ingest new csv
export const tick = async (skipFetch: boolean) => {
  const label = skipFetch ? 'seed tick (ingest only)' : 'cron tick';
  const start = Date.now();
  console.log(`[cron] ${label} at ${new Date().toISOString()}`);
  try {
    await fetchViolations();
    console.log(`[cron] tick done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  } catch (err) {
    // Log and continue — a single tick failure shouldn't kill the schedule.
    console.error(`[cron] ${label} failed:`, err instanceof Error ? err.message : err);
  }
};

// TODO implement a stop flag to stop and start the cron
// First tick suppresses notifications only if the DB doesn't look seeded (check SEED_THRESHOLD)
export const startCron = async (intervalMs = DEFAULT_INTERVAL_MS) => {
  const violationCount = await ViolationModel.estimatedDocumentCount();
  let firstTick = true;
  while (true) {
    await tick({ notify: isSeeded || !firstTick });
    firstTick = false;
    console.log(`[cron] next tick in ${intervalMs / 1000}s`);
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
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
