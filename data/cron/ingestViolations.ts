import { createReadStream, createWriteStream } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse";
import * as z from "zod";
import { connect, disconnect } from "../config/mongoConnection.js";
import { ViolationInputSchema, ViolationModel } from "../models/Violation.js";
import { BuildingModel } from "../models/Building.js";

// TODO should I extract this path to a different file to reuse in both fetch and ingest?
const IN_PATH = "data/cron/violations.csv";
const FAILED_LOG = "data/cron/failedDbWrites.log";

// Aligned to HPD borough IDs. Usage: BORO_NAMES[boroId - 1]
const BORO_NAMES = ["MANHATTAN", "BRONX", "BROOKLYN", "QUEENS", "STATEN ISLAND"] as const;
type BoroName = (typeof BORO_NAMES)[number];

const titleCase = (s: string) =>
  s.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase());
 
// csv-parse emits "" for empty cells; strip them so Zod .optional() fields validate.
const stripEmpty = (row: Record<string, string>) => {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v !== "") out[k] = v;
  }
  return out;
};

// Doesn't have to strictly align with Violations since zod drops fields not in schema
const apiToInput = (row: Record<string, string>) => ({
  violationId: row["violationid"],
  bin: row["bin"],
  registrationId: row["registrationid"],
  houseNumber: row["housenumber"],
  streetName: row["streetname"],
  apartment: row["apartment"],
  boroId: row["boroid"],
  // Socrata csv exports use "postcode" but the API's csv/json uses "zip"
  zip: row["postcode"] ?? row["zip"],
  class: row["class"],
  rentImpairing: row["rentimpairing"],
  description: row["novdescription"],
  orderNumber: row["ordernumber"],
  currentStatus: row["currentstatus"],
  currentStatusDate: row["currentstatusdate"],
  violationStatus: row["violationstatus"],
  inspectionDate: row["inspectiondate"],
  approvedDate: row["approveddate"],
  novIssuedDate: row["novissueddate"],
  originalCorrectByDate: row["originalcorrectbydate"],
  newCorrectByDate: row["newcorrectbydate"],
  certifiedDate: row["certifieddate"],
});

const formatAddress = (
  houseNumber: string,
  streetName: string,
  zip: string | undefined,
  boro: BoroName,
) => {
  const tail = zip ? `, NY ${zip}` : ", NY";
  return `${houseNumber} ${titleCase(streetName)}, ${titleCase(boro)}${tail}`;
};

// We assume the caller will be opening/closing mongoose connections
export const ingestViolations = async () => {
  // Helper that streams failures to disk - don't buffer in array, else OOM
  const failLog = createWriteStream(FAILED_LOG, { flags: "w" });
  let failedCount = 0;
  const recordFailure = (entry: object) => {
    failedCount++;
    failLog.write(JSON.stringify(entry) + "\n");
  };

  let inserted = 0;
  let total = 0;
  try {
    // Stream-parse since initial file can be very large
    // Socrata csv exports use PascalCase and api csv/json use lowercase
    const parser = createReadStream(IN_PATH).pipe(
      parse({
        columns: header => header.map((h: string) => h.toLowerCase()),
        bom: true,
        skip_empty_lines: true,
        trim: true,
      }),
    );

    for await (const rawRow of parser as AsyncIterable<Record<string, string>>) {
      total++;
      const row = stripEmpty(rawRow);
      const parsed = ViolationInputSchema.safeParse(apiToInput(row));
      if (!parsed.success) {
        recordFailure({
          violationid: row["violationid"],
          reason: `validation: ${z.prettifyError(parsed.error)}`,
          row,
        });
        continue;
      }

      const { boroId, ...rest } = parsed.data;
      const boro = BORO_NAMES[boroId - 1] as BoroName;

      try {
        // setOnInsert so we never overwrite an existing building's data
        // setDefaultsOnInsert - same as new buildingDoc.save() where we apply 
        // schema defaults on insert
        const building = await BuildingModel.findOneAndUpdate(
          { BIN: rest.bin },
          {
            $setOnInsert: {
              BIN: rest.bin,
              address: formatAddress(rest.houseNumber, rest.streetName, rest.zip, boro),
            },
          },
          { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
        );

        // Update or insert is quicker than !findOne && insertOne/updateOne
        // Update for status changes
        await ViolationModel.updateOne(
          { violationId: rest.violationId },
          { $set: { ...rest, boro, buildingId: building._id } },
          { upsert: true },
        );
        inserted++;

      } catch (err) {
        recordFailure({
          violationid: rest.violationId,
          reason: `db: ${err instanceof Error ? err.message : String(err)}`,
          row,
        });
      }
    }

    console.log(
      `ingested ${inserted}/${total}, failed ${failedCount}` +
        (failedCount ? ` (see ${FAILED_LOG})` : ""),
    );
  } finally {
    await new Promise<void>(resolve => failLog.end(resolve));
  }
  return { inserted, total, failedCount };
};

// Set up connection since there's no caller dbconn
// Run as main with
// npx tsx data/cron/ingestViolations.ts
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await connect();
  try {
    await ingestViolations();
  } finally {
    await disconnect();
  }
}
