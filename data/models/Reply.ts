import * as z from 'zod';
import { Types } from 'mongoose';
import { Schema, model, type HydratedDocument } from 'mongoose';

export const ReplyInputSchema = z.object({
  topicId: z.instanceof(Types.ObjectId),
  replyText: z.string().trim().min(1).max(2000),
});

export const ReplyStoredSchema = ReplyInputSchema.extend({
  userId: z.instanceof(Types.ObjectId),
  timeCreated: z.date(),
});

export type Reply = z.infer<typeof ReplyStoredSchema>;

const ReplyDbSchema = new Schema<Reply>({
  topicId: { type: Schema.Types.ObjectId, ref: 'Comment', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  replyText: { type: String, required: true, maxlength: 2000, trim: true },
  timeCreated: { type: Date, required: true, default: Date.now },
});

export const ReplyModel = model<Reply>('Reply', ReplyDbSchema);
export type ReplyDoc = HydratedDocument<Reply>;