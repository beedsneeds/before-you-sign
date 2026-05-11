import * as z from 'zod';
import { Schema, model, type HydratedDocument } from 'mongoose';

// See data/models/README.md

export const BuildingInputSchema = z.object({
  address: z
    .string()
    .normalize()
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address cannot be more than 200 characters')
    .regex(/[a-zA-Z]/, 'Address must contain at least one letter')
    .regex(
      /^[a-zA-Z0-9 ,.'\-#/]+$/,
      "Address may only contain letters, numbers, spaces, and , . ' - # /",
    ),
  BIN: z.number().positive('BIN must be positive').int('BIN must be a whole number'),
  // HPD owner registration. Same regID across buildings implies same registered owner.
  // Sourced from violation rows during ingest; 0 (unregistered) is rejected so absence is null.
  regID: z
    .number()
    .int('regID must be a whole number')
    .positive('regID must be positive')
    .optional(),
});

// These have to be cached to prevent unnecessary db calls
export const BuildingStoredSchema = BuildingInputSchema.extend({
  avgRating: z.number().min(0).max(5),
  reviewsCount: z.number().int().nonnegative(),
});

// violation ID list

export type Building = z.infer<typeof BuildingStoredSchema>;

const BuildingDbSchema = new Schema<Building>({
  address: { type: String, required: true, maxlength: 200, trim: true },
  BIN: { type: Number, required: true, unique: true },
  regID: { type: Number, min: 1, index: true },
  avgRating: { type: Number, required: true, default: 0, min: 0, max: 5 },
  reviewsCount: { type: Number, required: true, default: 0, min: 0 },
});

export const BuildingModel = model<Building>('Building', BuildingDbSchema);
export type BuildingDoc = HydratedDocument<Building>;
