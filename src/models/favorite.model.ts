import mongoose, {Document, Schema} from "mongoose";

const FavoriteSchema : Schema = new Schema ({
    userId : {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        unique: true 
    }, 
    plants: [{
        type: Schema.Types.ObjectId, 
        ref: 'Plant'
    }]
},{
    timestamps: true
});


export interface IFavorite extends Document{
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    plants: mongoose.Types.ObjectId[];
    createdAt: Date; 
    updatedAt: Date; 
}

export const FavoriteModel = mongoose.models.favorite || mongoose.model<IFavorite>('Favorite', 
    FavoriteSchema
);

