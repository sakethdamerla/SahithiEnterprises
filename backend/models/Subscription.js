import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    endpoint: { type: String, required: true, unique: true },
    keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true }
    },
    date: { type: Date, default: Date.now }
});

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
