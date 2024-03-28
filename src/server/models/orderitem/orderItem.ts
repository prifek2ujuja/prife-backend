import mongoose, { Schema } from 'mongoose';
import { ProductScheme } from '../product/index.js';


export const OrderItemScheme = new Schema({
    product: {
        type: ProductScheme,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    }
})

const OrderItem = mongoose.model("OrderItem", OrderItemScheme)
export default OrderItem