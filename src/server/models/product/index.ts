import mongoose, { Schema } from 'mongoose';
import { ImageScheme } from '../image/index.js';

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
    description: {
        type: String,
        required: true,
    },
    productImage: {
        type: String,
        required: true,
    },
    productImages: {
        type: [ImageScheme]
    }
})

const Product = mongoose.model('Product', ProductScheme);
export default Product;