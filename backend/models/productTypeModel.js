import mongoose from 'mongoose';

const productTypeSchema = new mongoose.Schema({
    category: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        required: true 
    },
    code: { 
        type: String, 
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: ''
    },
    date: {
        type: Number,
        default: Date.now
    }
});

export default mongoose.model('ProductType', productTypeSchema);
