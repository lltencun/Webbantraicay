import mongoose from 'mongoose';

const productDetailSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    color: {
        type: String,
        required: true
    },
    nutritional_info: {
        type: String,
        required: true
    },
    sizes: { 
        type: Array, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    available: { 
        type: Boolean, 
        default: true 
    },
    bestseller: { 
        type: Boolean,
        default: false
    },
    discontinued: {
        type: Boolean,
        default: false
    }
});

export default mongoose.model('ProductDetail', productDetailSchema);
