require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http'); // Import http

const app = express();
const paymentRoutes = require('./routes/paymentRoutes');
// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    methods: ['GET', 'POST', 'PUT']
}));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB Connected!"))
    .catch(err => console.log(err));
// CORRECTED ROUTE REGISTRATION
app.use('/api', require('./routes/listingRoutes')); // Changed to /api

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/payments', paymentRoutes);

const { setupWebSocket } = require('./websocket');

const PORT = process.env.PORT || 5000;

// HTTP সার্ভার তৈরি
const server = http.createServer(app); // Create server with express app

// WebSocket সেটআপ
const wss = setupWebSocket(server);
app.set('wss', wss);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket running on ws://localhost:${PORT}/ws`);
});