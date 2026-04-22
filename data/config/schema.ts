import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
    "UserID": {type: Schema.Types.ObjectId, required: true},
    
});