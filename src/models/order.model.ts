import mongoose , {Document, Schema} from "mongoose";

const OrderItemSchema = new Schema ({
    plantId: {type:Schema.Types.ObjectId, ref: 'Plant', required : true},
    quantity: {type:Number, required : true},
    price: { type: Number, required :true},

}, {_id: false});

const OrderSchema = new Schema ({
    userId : {type: Schema.Types.ObjectId, ref : 'User', required : true},
    items : [OrderItemSchema],
    totalAmount : {type: Number, required: true}, 
    paymentStatus : {
        type: String, 
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    }, 
    paymentMethod: {type: String, default: 'cash_on_delivery'},
    transactionId: {type: String}, 
    paidAt: {type: Date}
}, {timestamps: true});

export const OrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema);