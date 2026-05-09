import * as z from 'zod';
import { Schema, model, type HydratedDocument } from 'mongoose';

// See data/models/README.md

export const BuildingInputSchema = z.object({
  address: z
    .string()
    .normalize()
    .trim()
    .min(1, 'Address must be supplied')
    .max(200, 'Address cannot be more than 200 characters'),
  BIN: z.number().positive('BIN must be positive').int('BIN must be a whole number'),
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
  avgRating: { type: Number, required: true, default: 0, min: 0, max: 5 },
  reviewsCount: { type: Number, required: true, default: 0, min: 0 },
});

export const BuildingModel = model<Building>('Building', BuildingDbSchema);
export type BuildingDoc = HydratedDocument<Building>;
