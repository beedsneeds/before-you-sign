import { createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse';
import * as z from 'zod';
import { connect, disconnect } from '../config/mongoConnection.js';
import { ViolationInputSchema, ViolationModel, type ViolationDoc } from '../models/Violation.js';
import { BuildingModel } from '../models/Building.js';

// TODO should I extract this path to a different file to reuse in both fetch and ingest?
const IN_PATH = 'data/cron/violations.csv';

// Aligned to HPD borough IDs. Usage: BORO_NAMES[boroId - 1]
type BoroName = 'MANHATTAN' | 'BRONX' | 'BROOKLYN' | 'QUEENS' | 'STATEN ISLAND';
const BORO_NAMES: BoroName[] = ['MANHATTAN', 'BRONX', 'BROOKLYN', 'QUEENS', 'STATEN ISLAND'];

const titleCase = (s: string) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

// csv-parse outputs "" for empty cells so strip them for Zod .optional() 
const stripEmpty = (row: Record<string, string>) => {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v !== '') out[k] = v;
  }
  return out;
};

// Doesn't have to strictly align with Violations since zod drops fields not in schema
const apiToInput = (row: Record<string, string>) => ({
  violationId: row['violationid'],
  bin: row['bin'],
  registrationId: row['registrationid'],
  houseNumber: row['housenumber'],
  streetName: row['streetname'],
  apartment: row['apartment'],
  boroId: row['boroid'],
  // Socrata csv exports use "postcode" but the API's csv/json uses "zip"
  zip: row['postcode'] ?? row['zip'],
  class: row['class'],
  rentImpairing: row['rentimpairing'],
  description: row['novdescription'],
  orderNumber: row['ordernumber'],
  currentStatus: row['currentstatus'],
  currentStatusDate: row['currentstatusdate'],
  violationStatus: row['violationstatus'],
  inspectionDate: row['inspectiondate'],
  approvedDate: row['approveddate'],
  novIssuedDate: row['novissueddate'],
  originalCorrectByDate: row['originalcorrectbydate'],
  newCorrectByDate: row['newcorrectbydate'],
  certifiedDate: row['certifieddate'],
});

const formatAddress = (
  houseNumber: string,
  streetName: string,
  zip: string | undefined,
  boro: BoroName,
) => {
  const tail = zip ? `, NY ${zip}` : ', NY';
  return `${houseNumber} ${titleCase(streetName)}, ${titleCase(boro)}${tail}`;
};

// 1. We assume the caller will be opening/closing mongoose connections
// 2. collectNew-ly created Violations but not on the seed tick since 
//    - Don't want to OOM
//    - Spam users with updates from years ago
export const ingestViolations = async ({ collectNew = false }: { collectNew?: boolean } = {}) => {
  let failedCount = 0;
  const recordFailure = (entry: { violationid?: string | number; reason: string }) => {
    failedCount++;
    console.error(`[ingest is running] ${entry.violationid ?? '?'}: ${entry.reason}`);
  };

  const newViolations: ViolationDoc[] = [];
  let processed = 0;
  let total = 0;

  // Stream-parse since initial file can be very large
  // Socrata csv exports use PascalCase and api csv/json use lowercase
  const fileStream = createReadStream(IN_PATH);
  const parser = fileStream.pipe(
    parse({
      columns: (header) => header.map((h: string) => h.toLowerCase()),
      bom: true,
      skip_empty_lines: true,
      trim: true,
    }),
  );
  fileStream.on("error", err => parser.destroy(err));

  for await (const rawRow of parser as any) {
    total++;
    const row = stripEmpty(rawRow);
    const parsed = ViolationInputSchema.safeParse(apiToInput(row));
    if (!parsed.success) {
      recordFailure({
        violationid: row['violationid'],
        reason: `validation: ${z.prettifyError(parsed.error)}`,
      });
      continue;
    }

    const data = parsed.data;
    const boro = BORO_NAMES[data.boroId - 1];

    try {
      // 0 = unregistered owner. treat as absent so we don't index a meaningless value
      const regID = data.registrationId && data.registrationId > 0 ? data.registrationId : undefined;

      let building = await BuildingModel.findOne({ BIN: data.bin });
      if (!building) {
        building = await BuildingModel.create({
          BIN: data.bin,
          address: formatAddress(data.houseNumber, data.streetName, data.zip, boro),
          regID,
        });
      } else if (regID && !building.regID) {
        building.regID = regID;
        await building.save();
      }

      const violation = await ViolationModel.findOne({ violationId: data.violationId });
      if (violation) {
        Object.assign(violation, data, { boro, buildingId: building._id });
        await violation.save();
      } else {
        // We only notify new violations (within scope of project proposal)
        const created = await ViolationModel.create({ ...data, boro, buildingId: building._id });
        if (collectNew) newViolations.push(created);
      }
      processed++;
    } catch (err) {
      recordFailure({
        violationid: data.violationId,
        reason: `db: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  console.log(`ingested ${processed}/${total}, failed ${failedCount}`);
  return { processed, total, failedCount, newViolations };
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
