import mongoose, { Model, Schema } from 'mongoose';
import  { OrderItemScheme } from '../orderitem/orderItem.js';
import { UserScheme } from '../user/index.js';

interface IOrder {
    customerId: Schema.Types.ObjectId;
    orderItems: typeof OrderItemScheme[];
    paymentStatus: string;
    orderTotal: number;
    delivery: string;
    paymentMode: string;
    refCode: string;
    salesPerson: typeof UserScheme;
}

interface IOrderMethods {
    orderTotal(): number;
}

type OrderModel = Model<IOrder, {}, IOrderMethods>;


const OrderScheme =  new Schema<IOrder, OrderModel, IOrderMethods>({
    customerId: {
        type: Schema.Types.ObjectId,
        required: false,
    },
    orderItems: [OrderItemScheme],
    paymentStatus: {
        type: String,
        required: false,
    },
    orderTotal: {
        type: Number,
        required: true
    },
    delivery: {
        type: String,
        default: "pickup",
    },
    paymentMode: {
        type: String,
       required: true,
    },
    refCode: {
        type: String,
       required: false,
    },
    salesPerson: {
        type: UserScheme,
        required: false,
    }
},
{
    timestamps: true,
  })


const Order = mongoose.model('Order', OrderScheme)
export default Order;   