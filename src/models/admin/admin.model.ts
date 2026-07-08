import mongoose, { Document, Schema } from "mongoose"; 
import { AdminType } from "../../types/admin/admin.type";

const AdminSchema: Schema = new Schema({
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
        minLength: 6 
    },
    profilePicture: {
        type: String,
        required: false,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin'],
        default: 'admin',
    }
}, {
    timestamps: true,
});

export interface IAdmin extends AdminType, Document {
    fullName: any; 
    username: any;
    profilePicture: string;
    _id: mongoose.Types.ObjectId; 
    createdAt: Date; 
    updatedAt: Date;
}

export const AdminModel = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
