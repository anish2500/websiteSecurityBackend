import mongoose, { Schema, Document} from "mongoose"; 

const ActivityLogSchema = new Schema ({
    userId: { type: Schema.Types.ObjectId, index: true}, 
    action: { type: String, required: true}, 
    ip: String, 
    userAgent: String, 
    metadata: { type: Schema.Types.Mixed}, 

}, { timestamps: true});


export interface IActivityLog extends Document {
    userId?: mongoose.Types.ObjectId; 
    action: string; 
    ip?: string; 
    userAgent?: string; 
    metadata?: Record<string, any>;
    createdAt: Date; 
}


export const ActivityLogModel = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);