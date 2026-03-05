import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/database.js';
import { initNotificationService } from './services/notificationService.js';
import resumeRoutes from './routes/resume.routes.js';
import jdRoutes from './routes/jd.routes.js';
import aiRoutes from './routes/ai.routes.js';
import applicationRoutes from './routes/application.routes.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Initialize notification service
initNotificationService(io);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'ApplySmart Node.js Backend' });
});

// Routes
app.use('/api/resume', resumeRoutes);
app.use('/api/jd', jdRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/application', applicationRoutes);

// Socket.IO
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});