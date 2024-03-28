import mongoose, { Schema } from 'mongoose';


const CustomerScheme = new Schema({
    name: {
        type: String,
        // required: true,
    },
    phone: {
        type: String,
        // required: true,
    },
    email: {
        type: String,
    }
})

const Customer = mongoose.model('Customer', CustomerScheme)
export default Customer