import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cors from 'cors';
import { Server } from 'socket.io';

import { seedDatabaseIfEmpty } from './server/config/seed.js';
import authRoutes from './server/routes/auth.js';
import foodRoutes from './server/routes/foods.js';
import orderRoutes from './server/routes/orders.js';
import vendorRoutes from './server/routes/vendors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = 3000;

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Atlas Connection (Non-blocking with retry/graceful fallback)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://guptanikhil8424_db_user:RIGqlhsGX7FEikl8@cluster0.uxyfmlj.mongodb.net/foodmap?retryWrites=true&w=majority&appName=Cluster0';

async function connectMongoDB() {
  try {
    console.log('[MongoDB] Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[MongoDB] Connected successfully to MongoDB Atlas database: foodmap');
    await seedDatabaseIfEmpty();
  } catch (err) {
    console.error('[MongoDB Warning] Could not connect to Atlas immediately:', err.message);
    console.log('[MongoDB] Server is running. Will retry connection in background.');
  }
}

connectMongoDB();

// Socket.IO Room Management & Real-time Events
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join:vendor', (vendorId) => {
    socket.join(`vendor:${vendorId}`);
    console.log(`[Socket.IO] Socket ${socket.id} joined vendor:${vendorId}`);
  });

  socket.on('join:user', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`[Socket.IO] Socket ${socket.id} joined user:${userId}`);
  });

  socket.on('location:update', (data) => {
    socket.broadcast.emit('radar:locationUpdate', data);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Mount REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes(io));
app.use('/api/orders', orderRoutes(io));
app.use('/api/vendors', vendorRoutes(io));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FoodMap Fullstack Server',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString()
  });
});

// Vite Middleware for Dev / Static Files for Production
const isProduction = process.env.NODE_ENV === 'production';

async function setupFrontend() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    // Express 5 / path-to-regexp v8 wildcard syntax
    app.get('{*splat}', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupFrontend().catch((err) => {
  console.error('[Server Error] Frontend setup failed:', err);
});

// Start listening immediately on PORT (default 3000)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] FoodMap server running at http://0.0.0.0:${PORT}`);
});
