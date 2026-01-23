import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Product } from './models/Product.js';
import { Interest } from './models/Interest.js';
import { Traffic } from './models/Traffic.js';
import { Announcement } from './models/Announcement.js';
import { User } from './models/User.js';
import { protect, superadminOnly } from './middleware/auth.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/enterprise_products')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'enterprise_products',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage });

// Traffic Recording Endpoint (Called by frontend on app load)
app.post('/api/record-visit', async (req, res) => {
    try {
        // Use provided date from frontend (local time) or fallback to server time (UTC)
        const today = req.body.date || new Date().toISOString().split('T')[0];

        // Upsert: find record for today, increment visits. If not found, create new.
        await Traffic.findOneAndUpdate(
            { date: today },
            { $inc: { visits: 1 } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ message: 'Visit recorded' });
    } catch (error) {
        console.error('Error recording visit:', error);
        res.status(500).json({ message: 'Error recording visit' });
    }
});

// --- Auth Endpoints ---

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (user && (await user.comparePassword(password))) {
            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET || 'your_default_secret_key',
                { expiresIn: '30d' }
            );

            res.json({
                _id: user._id,
                username: user.username,
                role: user.role,
                permissions: user.permissions,
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create Admin (Superadmin Only)
app.post('/api/admin/create', protect, superadminOnly, async (req, res) => {
    try {
        const { username, password } = req.body;

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            password,
            role: 'admin'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                role: user.role
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Create Admin Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// List Admins (Superadmin Only)
app.get('/api/admin/list', protect, superadminOnly, async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('-password');
        res.json(admins);
    } catch (error) {
        console.error('List Admins Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update Admin Permissions (Superadmin Only)
app.patch('/api/admin/:id/permissions', protect, superadminOnly, async (req, res) => {
    try {
        const { permissions } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { permissions },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Update Permissions Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update Admin (Superadmin Only)
app.put('/api/admin/:id', protect, superadminOnly, async (req, res) => {
    try {
        const { username, password, permissions } = req.body;
        const admin = await User.findById(req.params.id);

        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        if (username) admin.username = username;
        if (password) admin.password = password; // Will be hashed by pre-save hook
        if (permissions) admin.permissions = permissions;

        await admin.save();

        const adminObj = admin.toObject();
        delete adminObj.password;

        res.json(adminObj);
    } catch (error) {
        console.error('Update Admin Error:', error);
        res.status(500).json({ message: 'Error updating admin' });
    }
});

// Delete Admin (Superadmin Only)
app.delete('/api/admin/:id', protect, superadminOnly, async (req, res) => {
    try {
        const admin = await User.findByIdAndDelete(req.params.id);
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error('Delete Admin Error:', error);
        res.status(500).json({ message: 'Error deleting admin' });
    }
});

// Get Traffic Data
app.get('/api/traffic', async (req, res) => {
    try {
        // Get last 30 days
        const trafficData = await Traffic.find().sort({ date: -1 }).limit(30);
        res.json(trafficData.reverse()); // Reverse to show oldest to newest
    } catch (error) {
        console.error('Error fetching traffic:', error);
        res.status(500).json({ message: error.message });
    }
});

// Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Cloudinary returns the url in req.file.path
        res.json({ imageUrl: req.file.path });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: error.message });
    }
});

// Add a product
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update a product
app.put('/api/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({ message: error.message });
    }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: error.message });
    }
});

// Rate a product
// Rate a product
app.post('/api/products/:id/rate', async (req, res) => {
    try {
        const { rating, userId } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Invalid rating (1-5)' });
        }
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (!product.ratings) {
            product.ratings = [];
        }

        // Check if user already rated
        const existingRatingIndex = product.ratings.findIndex(r => r.userId === userId);

        if (existingRatingIndex !== -1) {
            // Update existing rating
            product.ratings[existingRatingIndex].rating = rating;
            product.ratings[existingRatingIndex].date = new Date();
        } else {
            // Add new rating
            product.ratings.push({ userId, rating, date: new Date() });
        }

        await product.save();

        res.status(200).json(product);
    } catch (error) {
        console.error('Error rating product:', error);
        res.status(500).json({ message: error.message });
    }
});

// Submit Interest
app.post('/api/interests', async (req, res) => {
    try {
        const { mobile, productId, productTitle, username } = req.body;
        const newInterest = new Interest({
            mobile,
            productId,
            productTitle,
            username
        });
        const savedInterest = await newInterest.save();
        res.status(201).json(savedInterest);
    } catch (error) {
        console.error('Error submitting interest:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get Interests (Admin)
app.get('/api/interests', async (req, res) => {
    try {
        const interests = await Interest.find().sort({ date: -1 });
        res.json(interests);
    } catch (error) {
        console.error('Error fetching interests:', error);
        res.status(500).json({ message: error.message });
    }
});

// --- Announcements Endpoints ---

import webpush from 'web-push';
import { Subscription } from './models/Subscription.js';

// VAPID Keys - In production, these should be in environment variables
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BAyPKzO7w9lvfsg-oITsS4QFvFw1M9rRYAFoVtKuxCS7mJYKOH6M4UgWMUIV9vEBjdTZF7-A-fZZNq4oitiWNcg';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'X-sLEg5tcPaoxPG9giFf5RzMMsxPYjfRr0NaC0rDDw0';

webpush.setVapidDetails(
    'mailto:test@test.com',
    publicVapidKey,
    privateVapidKey
);

// Subscribe route
app.post('/api/subscribe', async (req, res) => {
    try {
        const subscription = req.body;
        // Check if exists
        const exists = await Subscription.findOne({ endpoint: subscription.endpoint });
        if (!exists) {
            const newSub = new Subscription(subscription);
            await newSub.save();
        }
        res.status(201).json({});
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get active announcements (Public)
app.get('/api/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.find({ isActive: true }).sort({ date: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all announcements (Admin)
app.get('/api/admin/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ date: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create announcement and notify
app.post('/api/announcements', async (req, res) => {
    try {
        const newAnnouncement = new Announcement(req.body);
        const savedAnnouncement = await newAnnouncement.save();

        // Send Notification asynchronously
        const payload = JSON.stringify({
            title: newAnnouncement.title,
            body: newAnnouncement.message,
            icon: '/pwa-192x192.png'
        });

        // Fetch all subscriptions and send
        Subscription.find().then(subscriptions => {
            subscriptions.forEach(sub => {
                webpush.sendNotification(sub, payload).catch(err => {
                    console.error('Notification error', err);
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription has expired or is no longer valid
                        Subscription.findByIdAndDelete(sub._id).catch(e => console.error('Error deleting sub', e));
                    }
                });
            });
        });

        res.status(201).json(savedAnnouncement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete announcement
app.delete('/api/announcements/:id', async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
