import mongoose, { Model, Schema } from "mongoose";
import { OrderItemScheme } from "../orderitem/orderItem.js";
import { UserScheme } from "../user/index.js";

interface IOrder {
  customerId: Schema.Types.ObjectId;
  orderItems: (typeof OrderItemScheme)[];
  paymentStatus: string;
  orderTotal: number;
  delivery: string;
  paymentMode: string;
  refCode: string;
  deliveryAddress: string;
  salesPerson: typeof UserScheme;
  status: string;
  statusDescription: string;
  paystackPaymentRef: string;
}

interface IOrderMethods {
  // orderTotal(): number;
}

type OrderModel = Model<IOrder, {}, IOrderMethods>;

const OrderScheme = new Schema<IOrder, OrderModel, IOrderMethods>(
  {
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
      required: true,
    },
    delivery: {
      type: String,
      default: "pickup",
    },
    deliveryAddress: {
      type: String,
    },
    paymentMode: {
      type: String,
      required: false,
    },
    refCode: {
      type: String,
      required: false,
    },
    salesPerson: {
      type: UserScheme,
      required: false,
    },
    // Can include, processing, processed, failed, picked, delivering, delivered
    status: {
      type: String,
      default: "processing",
    },
    statusDescription: {
      type: String
    },
    paystackPaymentRef: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", OrderScheme);
export default Order;
