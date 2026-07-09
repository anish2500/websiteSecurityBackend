import mongoose, { Document, Schema } from "mongoose"; 
import { UserType } from "../types/user.type";

const UserSchema: Schema = new Schema({
    fullName: { 
        type: String, 
        required: false, 
        trim: true 
    }, 
    username: { 
        type: String, 
        required: false, 
        trim: true 
    }, 
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true 
    }, 
    password: {
        type: String,
        required: true,
        minlength: 12
    },
    passwordChangedAt: {
        type: Date,
        default: Date.now
    },
    passwordHistory: {
        type: [String],   // last N bcrypt hashes, oldest dropped
        default: []
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    },
    profilePicture: {
        type: String,
        required: false,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    }
}, {
    timestamps: true,
});

export interface IUser extends UserType, Document {
    fullName: any;
    username: any;
    profilePicture: string;
    passwordChangedAt?: Date;
    passwordHistory?: string[];
    failedLoginAttempts?: number; 
    lockUntil?: Date | null; 
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);