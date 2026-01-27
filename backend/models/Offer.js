import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String },
    titleColor: { type: String, default: '#ffffff' },
    descriptionColor: { type: String, default: '#ffffff' },
    position: { type: String, default: 'left' }, // 'left', 'center', 'right' for text alignment/position
    link: { type: String }, // Optional navigation link
    category: { type: String, default: 'home' }, // 'home' or category slug
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

export const Offer = mongoose.model('Offer', offerSchema);
