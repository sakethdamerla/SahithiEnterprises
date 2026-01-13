import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Product } from './models/Product.js';
import { Interest } from './models/Interest.js';
import { Traffic } from './models/Traffic.js';

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
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
