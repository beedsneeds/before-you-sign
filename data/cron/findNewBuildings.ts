import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { connect, disconnect } from '../config/mongoConnection.js';
import { ViolationModel } from '../models/Violation.js';
import { BuildingModel } from '../models/Building.js';

// Utility-only file:
// Tells you what notifySubscribers would fire on the next cron tick
// npx tsx data/cron/findNewBuildings.ts

const API = 'https://data.cityofnewyork.us/resource/wvxf-dwi5.json';

export const findNewBuildings = async () => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19);
  const url = new URL(API);
  url.searchParams.set('$where', `currentstatusdate > '${since}'`);
  url.searchParams.set('$limit', '50000');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Socrata ${res.status}: ${await res.text()}`);
  const rows = (await res.json()) as Array<{ violationid?: string; bin?: string }>;

  const apiIds = rows.filter((r) => r.violationid).map((r) => Number(r.violationid));
  const existing = await ViolationModel.find(
    { violationId: { $in: apiIds } },
    { violationId: 1 },
  );
  const existingIds = new Set(existing.map((v) => v.violationId));

  const newCountByBin = new Map<number, number>();
  for (const r of rows) {
    if (!r.violationid || !r.bin) continue;
    if (existingIds.has(Number(r.violationid))) continue;
    const bin = Number(r.bin);
    newCountByBin.set(bin, (newCountByBin.get(bin) ?? 0) + 1);
  }

  if (newCountByBin.size === 0) {
    console.log('No new violations would fire on the next tick. Try again in a few minutes.');
    return;
  }

  const bins = [...newCountByBin.keys()];
  const buildings = await BuildingModel.find({ BIN: { $in: bins } });

  console.log(
    `Next tick would notify on ${buildings.length} building(s) already in the DB:\n`,
  );
  for (const b of buildings) {
    const n = newCountByBin.get(b.BIN) ?? 0;
    console.log(
      `  ${b.address} (BIN ${b.BIN}): ${n} new violation${n === 1 ? '' : 's'}`,
    );
  }

  const known = new Set(buildings.map((b) => b.BIN));
  const unknownCount = bins.filter((bin) => !known.has(bin)).length;
  if (unknownCount > 0) {
    console.log(
      `\n${unknownCount} more BIN(s) aren't in the DB yet. They'd get created on the tick, so favorite one of the above to see a notification when the cron runs next`,
    );
  }
};

// Set up connection since there's no caller dbconn
// Run as main with
// npx tsx data/cron/findNewBuildings.ts
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await connect();
  try {
    await findNewBuildings();
  } finally {
    await disconnect();
  }
}
