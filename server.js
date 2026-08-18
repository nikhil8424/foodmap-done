import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';

import authRoutes from './server/routes/auth.js';
import foodRoutes from './server/routes/foods.js';
import orderRoutes from './server/routes/orders.js';
import vendorRoutes from './server/routes/vendors.js';
import { seedDatabaseIfEmpty } from './server/config/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://guptanikhil8424_db_user:RIGqlhsGX7FEikl8@cluster0.uxyfmlj.mongodb.net/foodmap?retryWrites=true&w=majority&appName=Cluster0';

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  // Setup Socket.IO
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  // Express middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Connect to MongoDB Atlas
  try {
    console.log('[MongoDB] Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('[MongoDB] Connected successfully to Atlas database: foodmap');
    await seedDatabaseIfEmpty();
  } catch (err) {
    console.error('[MongoDB Error] Connection failed:', err.message);
  }

  // Socket.IO Connection & Room Management
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join:vendor', (vendorId) => {
      socket.join(`vendor:${vendorId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined vendor room: vendor:${vendorId}`);
    });

    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined user room: user:${userId}`);
    });

    socket.on('location:update', (data) => {
      // Broadcast live movement (e.g. resident walking or vendor location)
      socket.broadcast.emit('radar:locationUpdate', data);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/foods', foodRoutes(io));
  app.use('/api/orders', orderRoutes(io));
  app.use('/api/vendors', vendorRoutes(io));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      time: new Date().toISOString()
    });
  });

  // Vite Integration (Dev middleware or Static production serving)
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    console.log('[Vite] Initializing Vite dev middleware...');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false // Respect platform requirement
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    console.log('[Express] Serving static assets from dist/ in production...');
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[FoodMap Server] Real-time backend listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Error] Fatal startup failure:', err);
});
