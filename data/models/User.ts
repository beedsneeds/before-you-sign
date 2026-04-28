
import * as z from "zod"
import { Types } from "mongoose"
import { Schema, model, type HydratedDocument } from "mongoose"

// See data/models/README.md

export const UserInputSchema = z.object({
    firstName: z.string().trim().max(40),
    lastName: z.string().trim().max(40),
    email: z.email(),
    password: z.string().min(8).max(128),
})

export const UserStoredSchema = UserInputSchema
    .omit({ password: true })
    .extend({
        hashedPassword: z.string(),
        isAdmin: z.boolean(),
        savedBuildings: z.array(z.instanceof(Types.ObjectId)),
        reviewIds: z.array(z.instanceof(Types.ObjectId)),
        commentIds: z.array(z.instanceof(Types.ObjectId)),
        // TODO fields: karma, notification preferences enum or z.literal("x", "y", "z")
    })

export type User = z.infer<typeof UserStoredSchema>;

const UserDbSchema = new Schema<User>({
    firstName: {type: String, required: true, maxlength: 40},
    lastName: {type: String, required: true, maxlength: 40},
    email: {type: String, required: true, unique: true, lowercase: true, trim: true},
    hashedPassword: {type: String, required: true},
    isAdmin: {type: Boolean, required: true, default: false},
    savedBuildings: [{type: Schema.Types.ObjectId, ref: "Building"}],
    reviewIds: [{type: Schema.Types.ObjectId, ref: "Review"}],
    commentIds: [{type: Schema.Types.ObjectId, ref: "Comment"}]
})

export const UserModel = model<User>("User", UserDbSchema)
export type UserDoc = HydratedDocument<User>



// const datetime = z.iso.datetime();
// z.iso.date() and time()
// datetime.parse("str")
// z.optional() and z.nullable() and nullish

// ip addr or mac for rate limiting?
// z.ipv4/6 z.mac

// For mongo objectId
// const objectIdString = z.string().refine(Types.ObjectId.isValid, "invalid id")
