
import * as z from "zod"
import { Types } from "mongoose"
import { Schema, model, type HydratedDocument } from "mongoose"

// See data/models/README.md

export const ReviewInputSchema = z.object({
    buildingId: z.instanceof(Types.ObjectId),
    reviewText: z.string().trim().max(2000).optional(),
    rating: z.number().int().min(1).max(5),
})

export const ReviewStoredSchema = ReviewInputSchema.extend({
    userId: z.instanceof(Types.ObjectId),
    timeCreated: z.date(),
})

export type Review = z.infer<typeof ReviewStoredSchema>;

const ReviewDbSchema = new Schema<Review>({
    buildingId: {type: Schema.Types.ObjectId, ref: "Building", required: true},
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    reviewText: {type: String, maxlength: 2000, trim: true},
    rating: {type: Number, required: true, min: 1, max: 5},
    timeCreated: {type: Date, required: true, default: Date.now},
})

export const ReviewModel = model<Review>("Review", ReviewDbSchema)
export type ReviewDoc = HydratedDocument<Review>
