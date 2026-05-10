import * as z from "zod";
import { Types } from "mongoose";
import { Schema, model, type HydratedDocument } from "mongoose";

// See data/models/README.md

export const UserInputSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z ]+$/, "first name must contain only letters and spaces"),
  lastName: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z ]+$/, "last name must contain only letters and spaces"),
  email: z.email().min(5).max(255),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/^\S+$/, "password must not contain whitespace")
    .regex(/[A-Z]/, "password must contain an uppercase letter")
    .regex(/[0-9]/, "password must contain a number")
    .regex(/[^a-zA-Z0-9]/, "password must contain a special character"),
});

export const NotifyMethod = z.enum(["email", "inApp"]);
export type NotifyMethod = z.infer<typeof NotifyMethod>;

export const UserStoredSchema = UserInputSchema.omit({ password: true }).extend({
  hashedPassword: z.string(),
  isAdmin: z.boolean(),
  activityScore: z.number().int().nonnegative(),
  savedBuildings: z.array(z.instanceof(Types.ObjectId)),
  notificationPrefs: z.array(NotifyMethod),
  reviewIds: z.array(z.instanceof(Types.ObjectId)),
  commentIds: z.array(z.instanceof(Types.ObjectId)),
  // TODO fields: karma
});

export type User = z.infer<typeof UserStoredSchema>;

const UserDbSchema = new Schema<User>({
  firstName: { type: String, required: true, maxlength: 40 },
  lastName: { type: String, required: true, maxlength: 40 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  hashedPassword: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false },
  activityScore: { type: Number, required: true, default: 0, min: 0 },
  savedBuildings: [{ type: Schema.Types.ObjectId, ref: "Building" }],
  notificationPrefs: { type: [{ type: String, enum: NotifyMethod.options }], default: ["inApp"] },
  reviewIds: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  commentIds: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

export const UserModel = model<User>("User", UserDbSchema);
export type UserDoc = HydratedDocument<User>;

// const datetime = z.iso.datetime();
// z.iso.date() and time()
// datetime.parse("str")
// z.optional() and z.nullable() and nullish

// ip addr or mac for rate limiting?
// z.ipv4/6 z.mac

// For mongo objectId
// const objectIdString = z.string().refine(Types.ObjectId.isValid, "invalid id")
