import mongoose, { Schema } from "mongoose";

const PurchaseItemScheme = new Schema({
   product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
   },
   quantityOrdered: {
      type: Number,
      required: true,
   },
   quantityReceived: {
      type: Number,
      default: 0,
   },
})

const PurchaseScheme = new Schema({
   user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
   },
   items: [PurchaseItemScheme],
   total: {
      type: Number,
      required: true,
   },
   status: { // pending, received, cancelled
      type: String,
      required: true,
   },
   parentPurchase: {
      type: Schema.Types.ObjectId,
      ref: 'Purchase',
      required: false,
   }
}, { timestamps: true })

export const Purchase = mongoose.model('Purchase', PurchaseScheme)
