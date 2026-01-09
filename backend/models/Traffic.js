import mongoose from 'mongoose';

const trafficSchema = new mongoose.Schema({
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true,
        unique: true
    },
    visits: {
        type: Number,
        default: 0
    },
    uniqueVisits: {
        type: Number,
        default: 0
    }
});

export const Traffic = mongoose.model('Traffic', trafficSchema);
