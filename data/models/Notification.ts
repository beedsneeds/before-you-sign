import * as z from 'zod';
import { Types } from 'mongoose';
import { Schema, model, type HydratedDocument } from 'mongoose';

// See data/models/README.md

export const NotificationStoredSchema = z.object({
  userId: z.instanceof(Types.ObjectId),
  buildingId: z.instanceof(Types.ObjectId),
  violationId: z.coerce.number().int().positive(),
  createdAt: z.date(),
});

export type Notification = z.infer<typeof NotificationStoredSchema>;

const NotificationDbSchema = new Schema<Notification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  buildingId: { type: Schema.Types.ObjectId, ref: 'Building', required: true },
  violationId: { type: Number, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

export const NotificationModel = model<Notification>('Notification', NotificationDbSchema);
export type NotificationDoc = HydratedDocument<Notification>;
