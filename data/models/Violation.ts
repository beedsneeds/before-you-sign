import * as z from 'zod';
import { Types } from 'mongoose';
import { Schema, model, type HydratedDocument } from 'mongoose';

// See data/models/README.md

const dateFromApi = z.coerce.date();
// for rentimpairing
const yesNoFromApi = z.enum(['Y', 'N']).transform((v) => v === 'Y');

const BOROS = ['MANHATTAN', 'BRONX', 'BROOKLYN', 'QUEENS', 'STATEN ISLAND'];

export const ViolationInputSchema = z.object({
  violationId: z.coerce.number().int().positive(),

  bin: z.coerce.number().int().positive(),

  // Same registrationId across rows implies same registered owner/contact
  // 0 = when they just can't
  registrationId: z.coerce.number().int().nonnegative().optional(),
  // There's also a HPD version of buildingId. Retain it and rename foreign key if
  // we'll ever join multiple tables

  // Address: {housenumber} {streetname}, {boro}, NY {zip}
  houseNumber: z.string().trim().max(20),
  streetName: z.string().trim().max(100),
  apartment: z.string().trim().max(20).optional(),
  // Using boroid since boro has both indexes and enums as data
  boroId: z.coerce.number().int().min(1).max(5),
  zip: z.string().trim().max(10).optional(),

  class: z.enum(['A', 'B', 'C', 'I']),
  // For most serious conditions. higher weightage to overall rating if true
  rentImpairing: yesNoFromApi.optional(),

  // novdescription and Penal Code Violation
  description: z.string().trim().max(2000),
  orderNumber: z.string().trim().max(50).optional(),

  // Distinguishes "still open after 2 years" from "closed last week"
  currentStatus: z.string().trim().max(100),
  currentStatusDate: dateFromApi.optional(),
  violationStatus: z.enum(['Open', 'Close']),

  inspectionDate: dateFromApi,
  // TODO we don't need both, do we?
  approvedDate: dateFromApi.optional(),
  novIssuedDate: dateFromApi.optional(),

  // For overdue violations
  originalCorrectByDate: dateFromApi.optional(),
  newCorrectByDate: dateFromApi.optional(),

  certifiedDate: dateFromApi.optional(),
});

export const ViolationStoredSchema = ViolationInputSchema.omit({ boroId: true }).extend({
  buildingId: z.instanceof(Types.ObjectId),
  boro: z.enum(['MANHATTAN', 'BRONX', 'BROOKLYN', 'QUEENS', 'STATEN ISLAND']),
});

export type Violation = z.infer<typeof ViolationStoredSchema>;

const ViolationDbSchema = new Schema<Violation>({
  violationId: { type: Number, required: true, unique: true, index: true },
  buildingId: { type: Schema.Types.ObjectId, ref: 'Building', required: true, index: true },

  bin: { type: Number, required: true, index: true },
  // bbl: {type: String, required: true, maxlength: 20},
  registrationId: { type: Number, index: true },

  boro: { type: String, required: true, enum: BOROS },
  houseNumber: { type: String, required: true, maxlength: 20 },
  streetName: { type: String, required: true, maxlength: 100 },
  zip: { type: String, maxlength: 10 },
  apartment: { type: String, maxlength: 20 },

  class: { type: String, required: true, enum: ['A', 'B', 'C', 'I'] },
  rentImpairing: { type: Boolean },

  description: { type: String, required: true, maxlength: 2000 },
  orderNumber: { type: String, maxlength: 50 },

  currentStatus: { type: String, required: true, maxlength: 100 },
  currentStatusDate: { type: Date },
  violationStatus: { type: String, required: true, enum: ['Open', 'Close'] },

  inspectionDate: { type: Date, required: true },
  approvedDate: { type: Date },
  novIssuedDate: { type: Date },
  originalCorrectByDate: { type: Date },
  newCorrectByDate: { type: Date },
  certifiedDate: { type: Date },
});

export const ViolationModel = model<Violation>('Violation', ViolationDbSchema);
export type ViolationDoc = HydratedDocument<Violation>;
