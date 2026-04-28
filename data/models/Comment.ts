
import * as z from "zod"
import { Types } from "mongoose"
import { Schema, model, type HydratedDocument } from "mongoose"

// See data/models/README.md

export const CommentInputSchema = z.object({
    buildingId: z.instanceof(Types.ObjectId),
    reviewId: z.instanceof(Types.ObjectId).optional(),
    commentText: z.string().trim().min(1).max(2000),
})

export const CommentStoredSchema = CommentInputSchema.extend({
    userId: z.instanceof(Types.ObjectId),
    timeCreated: z.date(),
})

export type Comment = z.infer<typeof CommentStoredSchema>;

const CommentDbSchema = new Schema<Comment>({
    buildingId: {type: Schema.Types.ObjectId, ref: "Building", required: true},
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    reviewId: {type: Schema.Types.ObjectId, ref: "Review"},
    commentText: {type: String, required: true, maxlength: 2000, trim: true},
    timeCreated: {type: Date, required: true, default: Date.now},
})

export const CommentModel = model<Comment>("Comment", CommentDbSchema)
export type CommentDoc = HydratedDocument<Comment>
