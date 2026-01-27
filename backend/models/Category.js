import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Slug/ID
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String }, // Cloudinary URL
    imagePublicId: { type: String }, // For deletion
    titleColor: { type: String, default: '#000000' },
    textColor: { type: String, default: '#000000' }, // Description or general text
    productCount: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

export const Category = mongoose.model('Category', categorySchema);
