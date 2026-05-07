import mongoose from 'mongoose';
const { Schema } = mongoose;

export const UserSchema = new Schema({
  UserID: { type: Schema.Types.ObjectId, required: true },
});
