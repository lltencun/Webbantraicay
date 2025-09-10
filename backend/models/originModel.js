import mongoose from 'mongoose';

const originSchema = new mongoose.Schema({
    country: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    farm_name: {
        type: String,
        required: true
    },
    cultivation_method: {
        type: String,
        required: true
    }
});

export default mongoose.model('Origin', originSchema);
