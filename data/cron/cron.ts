import { fileURLToPath } from 'node:url';
import { connect, disconnect } from '../config/mongoConnection.js';
import { ViolationModel } from '../models/Violation.js';
import { fetchViolations } from './fetchViolations.js';
import { ingestViolations } from './ingestViolations.js';
import { notifySubscribers } from './notifySubscribers.js';

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;
// Simple heuristic to prevent notifications on the first fetch+ingest if db was not backfilled
// If violation rows < 100k, treat as cold start and suppress the first tick's notifications
// so we don't spam subscribers for historical rows
export const SEED_THRESHOLD = 100_000;

export const tick = async ({ notify = true }: { notify?: boolean } = {}) => {
  const start = Date.now();
  console.log(`[cron] tick at ${new Date().toISOString()}${notify ? '' : ' (notifications suppressed)'}`);
  try {
    await fetchViolations();
    const { newViolations } = await ingestViolations({ collectNew: notify });
    if (notify && newViolations.length > 0) {
      console.log(`[cron] ${newViolations.length} new violation(s) to notify on`);
      await notifySubscribers(newViolations);
    }
    console.log(`[cron] tick done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  } catch (err) {
    // Single tick failure shouldn't kill the process
    console.error('[cron] tick failed:', err instanceof Error ? err.message : err);
  }
};

// TODO implement a stop flag to stop and start the cron
// First tick suppresses notifications only if the DB doesn't look seeded (check SEED_THRESHOLD)
export const startCron = async (intervalMs = DEFAULT_INTERVAL_MS) => {
  const violationCount = await ViolationModel.estimatedDocumentCount();
  const isSeeded = violationCount >= SEED_THRESHOLD;
  if (!isSeeded) {
    console.log(
      `[cron] DB has ${violationCount} violations (< ${SEED_THRESHOLD}); treating as cold start, first-tick notifications suppressed`,
    );
  }
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
