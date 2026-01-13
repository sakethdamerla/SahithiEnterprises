import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    category: { type: String, required: true },
    isTemporarilyClosed: { type: Boolean, default: false },
    ratings: [{
        userId: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        date: { type: Date, default: Date.now }
    }],
});

export const Product = mongoose.model('Product', productSchema);
