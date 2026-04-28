// import mongoose from 'mongoose';
// const { Schema } = mongoose;

// const UserSchema = new Schema({
//     "UserID": {type: Schema.Types.ObjectId, required: true},
    
// });

import * as z from "zod"
import { Types } from "mongoose"

// Usage:
// try {
//   Player.parse({ username: 42, xp: "100" });
// } catch(error){
//   if(error instanceof z.ZodError){}

const UserSchema = z.object({
    // id: z.instanceof(Types.ObjectId),
    firstName: z.string().normalize().trim().max(40),
    lastName: z.string().normalize().trim().max(40),
    email: z.email(), // no need to normalize or trim since the regex manages everythin
    // hashedPassword: z.string().normalize().trim(), // Or z.hash("md5")?
    password: z.string().normalize().trim(),
    isAdmin: z.boolean(),
    savedBuildings: z.array(z.instanceof(Types.ObjectId)),
    reviewIds: z.array(z.instanceof(Types.ObjectId)),
    commentIds: z.array(z.instanceof(Types.ObjectId)),
    // TODO fields: karma, notification preferences enum or z.literal("x", "y", "z")
})
type User = z.infer<typeof UserSchema>;


const Building = z.object({
    id: z.instanceof(Types.ObjectId),
    address: z.string().normalize().trim().max(200),
    rating: z.number().min(0).max(5), // if that breaks, .gte(0).lte(5)
    BIN: z.number().positive().int(),
    // reviews: 

})

// const datetime = z.iso.datetime();
// z.iso.date() and time()
// datetime.parse("str")
// z.optional() and z.nullable() and nullish

// ip addr or mac for rate limiting?
// z.ipv4/6 z.mac
