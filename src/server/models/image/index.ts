import mongoose, { Schema } from 'mongoose';

export const ImageScheme = new Schema({
   imageUrl: {
    type: String
   },
   imagePath: {
    type: String
   }
})

const Image = mongoose.model('Image', ImageScheme);
export default Image;