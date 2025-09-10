import mongoose from 'mongoose';

const deliveryPersonSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true }
}, { timestamps: true });

const DeliveryPerson = mongoose.model('deliveryPerson', deliveryPersonSchema);

export default DeliveryPerson;