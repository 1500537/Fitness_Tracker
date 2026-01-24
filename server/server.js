import dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import workoutOverviewRoutes from "./routes/workoutOverviewRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import User from "./models/userModal.js";
import planRoutes from "./routes/planRoutes.js";
import revenueRoutes from "./routes/revenueRoutes.js";
import overviewRoutes from "./routes/overviewRoutes.js";

connectDB()
connectCloudinary()

const app = express()
const server = createServer(app);

// Socket.IO with environment variable control
let io = null;
if (process.env.ENABLE_SOCKET === 'true') {
  try {
    io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ["http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true,
      pingTimeout: 30000,
      pingInterval: 10000,
      upgradeTimeout: 10000,
      maxHttpBufferSize: 1e6
    });
    console.log('Socket.IO initialized successfully');
  } catch (error) {
    console.log('Socket.IO initialization failed:', error.message);
  }
} else {
  console.log('Socket.IO disabled via environment variable');
}

app.use(cors({
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
})) //Enable Cross-Origin Resource Sharing

// Raw body for Stripe webhooks (must be before express.json())
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json())
app.use(clerkMiddleware())

// Middleware to attach io to requests
app.use((req, res, next) => {
  req.io = io || null;
  next();
});

// Store io instance in app for controllers
app.set('io', io || null);

// API to listen to Clerk Webhooks
app.use('/api/clerk', clerkWebhooks);

// Workout routes
app.use('/api/workouts', workoutRoutes);

// Nutrition routes
app.use('/api/nutrition', nutritionRoutes);

// Progress routes
app.use('/api/progress', progressRoutes);

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// User routes
app.use('/api/users', userRoutes);

// Workout Overview routes (Admin)
app.use('/api/workout-overview', workoutOverviewRoutes);

// Plan routes
app.use('/api/plans', planRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Stripe routes
app.use('/api/stripe', stripeRoutes);

// Revenue routes
app.use('/api/revenue', revenueRoutes);

// Overview routes
app.use('/api/overview', overviewRoutes);

app.get('/', (req, res) => res.send("API is working..."))

// Socket.IO connection handling with error handling
if (io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Set socket timeout
    socket.setTimeout(30000);

    socket.on('join-user-room', async (userId) => {
      try {
        if (!userId) return;
        const user = await User.findById(userId);
        if (user && user.isBanned) {
          socket.emit('banned', { message: 'Your account has been banned' });
          socket.disconnect(true);
          return;
        }
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room`);
      } catch (error) {
        console.log('Join user room error:', error.message);
        socket.emit('error', { message: 'Failed to join user room' });
      }
    });

    socket.on('join-workouts-room', () => {
      socket.join('workouts');
    });

    socket.on('join-categories-room', () => {
      socket.join('categories');
    });

    socket.on('join-revenue-room', () => {
      socket.join('revenue');
    });

    socket.on('join-plans-room', () => {
      socket.join('plans');
    });

    socket.on('join-overview-room', () => {
      socket.join('overview');
    });

    socket.on('join-progress-room', (userId) => {
      if (userId) {
        socket.join(`progress-${userId}`);
        console.log(`User ${userId} joined progress room`);
      }
    });

    socket.on('ban-user', async (data) => {
      try {
        const { userId, banned } = data;
        if (!userId) return;
        await User.findByIdAndUpdate(userId, { isBanned: banned });
        io.to(`user_${userId}`).emit('banned', { message: banned ? 'Your account has been banned' : 'Your account has been unbanned' });
        if (banned) {
          io.in(`user_${userId}`).disconnectSockets();
        }
      } catch (error) {
        console.log('Ban user error:', error.message);
        socket.emit('error', { message: 'Failed to ban user' });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('User disconnected:', socket.id, 'Reason:', reason);
    });

    socket.on('error', (error) => {
      console.log('Socket error:', error.message);
    });

    socket.on('connect_error', (error) => {
      console.log('Socket connect error:', error.message);
    });
  });

  io.on('error', (error) => {
    console.log('Socket.IO server error:', error.message);
  });

  // Handle server-side connection errors
  io.engine.on('connection_error', (err) => {
    console.log('Socket.IO connection error:', err.req, err.code, err.message, err.context);
  });
}

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export for Vercel
export default app;