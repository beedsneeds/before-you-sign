import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";


const API_ENDPOINT = "https://data.cityofnewyork.us/resource/wvxf-dwi5.csv";

const LIMIT = 50000;

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "violations.csv");

export const fetchViolations = async () => {
  // since: Fetch data that's been updated in the last 7 days
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 19);

  const url = new URL(API_ENDPOINT);
  url.searchParams.set("$where", `currentstatusdate > '${since}'`);
  url.searchParams.set("$limit", String(LIMIT));

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Socrata ${res.status}: ${await res.text()}`);

  const csv = await res.text();
  await writeFile(OUT_PATH, csv);

  // Log row count fetched: newline count minus the header row
  const rowCount = csv.trim() === "" ? 0 : csv.trim().split("\n").length - 1;
  console.log(
    `Wrote ${rowCount} rows to ${OUT_PATH} (currentstatusdate > ${since}, limit ${LIMIT})`,
  );

  return { rowCount, since };
};

// Run as main with
// npx tsx data/cron/fetchViolations.ts
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await fetchViolations();
}
