import mongoose, {Document, Schema} from "mongoose";
import {CartType} from "../types/cart.type";

const CartItemSchema = new Schema ({
    plantId: {
        type: Schema.Types.ObjectId, 
        ref: 'Plant', 
        required : true, 
    },
    quantity: {
        type: Number, 
        required : true, 
        min: 1, 
        default: 1, 
    }, 
    price: {
        type: Number, 
        required: true
    }
}, {_id: false});

const CartSchema : Schema = new Schema ({
    userId: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        unique: true
    }, 
    items: [CartItemSchema], 
    totalAmount : {
        type: Number, 
        default: 0
    }
},{
    timestamps: true
});

export interface ICart extends CartType, Document {
    _id: mongoose.Types.ObjectId; 
    createdAt: Date; 
    updatedAt: Date; 
}

export const CartModel = mongoose.models.cart || mongoose.model<ICart> ('Cart', CartSchema);

