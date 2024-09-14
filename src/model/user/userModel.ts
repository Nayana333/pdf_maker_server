import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "./userType";

const userSchema: Schema<IUser> = new Schema({
    userName: { type: String, required: true },    
    email: { type: String, required: true, unique: true },  
    password: { type: String, required: true },   
    createdAt: { type: Date, default: Date.now }, 
}, {
    timestamps: true
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
