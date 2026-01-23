import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedSuperadmin = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        const existingSuperadmin = await User.findOne({ role: 'superadmin' });
        if (existingSuperadmin) {
            console.log('Superadmin already exists.');
            process.exit(0);
        }

        const superadmin = new User({
            username: 'superadmin',
            password: 'superadmin123', // Will be hashed by pre-save hook
            role: 'superadmin'
        });

        await superadmin.save();
        console.log('Superadmin created successfully!');
        console.log('Username: superadmin');
        console.log('Password: superadmin123');

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedSuperadmin();
