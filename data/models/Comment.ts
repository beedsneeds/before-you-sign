import * as z from 'zod';
import { Types } from 'mongoose';
import { Schema, model, type HydratedDocument } from 'mongoose';

// See data/models/README.md
//REMEMBER, comments are now called topics in "Forum" in buildings

export const CommentInputSchema = z.object({
  buildingId: z.instanceof(Types.ObjectId),
  reviewId: z.instanceof(Types.ObjectId).optional(),

  topicTitle: z
    .string()
    .trim()
    .min(5, 'Topic title must be at least 5 characters')
    .max(100, 'Topic title cannot be more than 100 characters')
    .regex(/[a-zA-Z]/, 'Topic title must contain at least one letter'),
});

export const CommentStoredSchema = CommentInputSchema.extend({
  userId: z.instanceof(Types.ObjectId),
  timeCreated: z.date(),
});

export type Comment = z.infer<typeof CommentStoredSchema>;

const CommentDbSchema = new Schema<Comment>({
  buildingId: { type: Schema.Types.ObjectId, ref: 'Building', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reviewId: { type: Schema.Types.ObjectId, ref: 'Review' },
  topicTitle: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },
 
  timeCreated: { type: Date, required: true, default: Date.now },
});

export const CommentModel = model<Comment>('Comment', CommentDbSchema);
export type CommentDoc = HydratedDocument<Comment>;
