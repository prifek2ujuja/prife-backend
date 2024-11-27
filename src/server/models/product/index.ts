/** @format */

import mongoose, { Schema } from "mongoose";
import { ImageScheme } from "../image/index.js";

export const ProductScheme = new Schema({
   name: {
      type: String,
      required: true,
   },
   price: {
      type: Number,
      required: true,
   },
   stock: {
      type: Number,
      required: true,
   },
   inStore: { type: Number, required: true, default: 0 },
   likes: {
      type: Number,
   },
   description: {
      type: String,
      required: true,
   },
   benefits: {
      type: [String],
      default: [],
   },
   productImage: {
      type: String,
      required: true,
   },
   productImages: {
      type: [ImageScheme],
   },
   category: {
      type: String,
      default: "supplement",
   },
});

const Product = mongoose.model("Product", ProductScheme);
export default Product;
