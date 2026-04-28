
import * as z from "zod"
import { Schema, model, type HydratedDocument } from "mongoose"

// See data/models/README.md

export const BuildingInputSchema = z.object({
    address: z.string().normalize().trim().max(200),
    BIN: z.number().positive().int(),
})

// These have to be cached to prevent unnecessary db calls 
export const BuildingStoredSchema = BuildingInputSchema.extend({
    avgRating: z.number().min(0).max(5),
    reviewsCount: z.number().int().nonnegative(), 
})

export type Building = z.infer<typeof BuildingStoredSchema>;

const BuildingDbSchema = new Schema<Building>({
    address: {type: String, required: true, maxlength: 200, trim: true},
    BIN: {type: Number, required: true, unique: true},
    avgRating: {type: Number, required: true, default: 0, min: 0, max: 5},
    reviewsCount: {type: Number, required: true, default: 0, min: 0},
})

export const BuildingModel = model<Building>("Building", BuildingDbSchema)
export type BuildingDoc = HydratedDocument<Building>
