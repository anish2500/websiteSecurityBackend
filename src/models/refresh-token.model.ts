import mongoose, { Schema, Document} from "mongoose"; 

const RefreshTokenSchema = new Schema ({
    userId: {type: Schema.Types.ObjectId, required: true, index: true},
    tokenHash: {type: String, required: true}, 
    expiresAt: {type: Date, required: true}, 
    revoked: {type: Boolean, default: false}, 

},{ timestamps: true});


export interface IRefreshToken extends Document {
    userId: mongoose.Types.ObjectId; 
    tokenHash: string; 
    expiresAt: Date; 
    revoked: boolean; 
}

export const RefreshTokenModel = mongoose.models.RefreshToken || mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);