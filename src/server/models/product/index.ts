import mongoose, { Schema } from 'mongoose';

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
    }
})

const Product = mongoose.model('Product', ProductScheme);
export default Product;