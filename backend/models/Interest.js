import mongoose from 'mongoose';

const interestSchema = new mongoose.Schema({
    username: { type: String, default: 'Guest' },
    mobile: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productTitle: { type: String }, // Storing title for easier display even if product is deleted
    date: { type: Date, default: Date.now },
});

export const Interest = mongoose.model('Interest', interestSchema);
