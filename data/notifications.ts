import { NotificationModel } from './models/Notification.js';
import { ViolationModel } from './models/Violation.js';
import { ObjectIdSchema, formatZodError } from '../helpers/validation.js';

const UserIdSchema = ObjectIdSchema;

export const getNotificationsForUser = async (userId: string) => {
  const parsed = UserIdSchema.safeParse(userId);
  if (!parsed.success) throw formatZodError(parsed.error);

  const notifs = await NotificationModel.find({ userId: parsed.data })
    .populate('buildingId')
    .sort({ createdAt: -1 })
    .lean();

  // violationId is a number, not an ObjectId ref so we need a manual join
  const violationIds: number[] = [];
  for (const n of notifs) {
    violationIds.push(n.violationId);
  }
  const violations = await ViolationModel.find(
    { violationId: { $in: violationIds } },
    { violationId: 1, class: 1, description: 1, currentStatus: 1 },
  ).lean();

  type ViolationProjection = (typeof violations)[number];
  const result: {
    _id: (typeof notifs)[number]['_id'];
    createdAt: Date;
    building: (typeof notifs)[number]['buildingId'];
    violation: ViolationProjection | null;
  }[] = [];
  for (const n of notifs) {
    let foundViolation: ViolationProjection | null = null;
    for (const v of violations) {
      if (v.violationId === n.violationId) {
        foundViolation = v;
        break;
      }
    }
    result.push({
      _id: n._id,
      createdAt: n.createdAt,
      building: n.buildingId,
      violation: foundViolation,
    });
  }
  return result;
};

export const clearNotificationsForUser = async (userId: string) => {
  const parsed = UserIdSchema.safeParse(userId);
  if (!parsed.success) throw formatZodError(parsed.error);

  await NotificationModel.deleteMany({ userId: parsed.data });
};
