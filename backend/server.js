import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Product } from './models/Product.js';
import { Interest } from './models/Interest.js';

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
