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
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  }
});

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
  req.io = io;
  next();
});

// Store io instance in app for controllers
app.set('io', io);

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

// Socket.IO connection handling
io.on('connection', (socket) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('User connected:', socket.id);
  }

  // Join user-specific room for real-time updates
  socket.on('join-user-room', async (userId) => {
    try {
      const user = await User.findById(userId);
      if (user && user.isBanned) {
        socket.emit('banned', { message: 'Your account has been banned' });
        socket.disconnect(true);
        return;
      }
      socket.join(`user_${userId}`);
    } catch (error) {
      socket.disconnect(true);
    }
  });

  // Join admin rooms for workout management
  socket.on('join-workouts-room', () => {
    socket.join('workouts');
  });

  socket.on('join-categories-room', () => {
    socket.join('categories');
  });

  // Join admin rooms for revenue management
  socket.on('join-revenue-room', () => {
    socket.join('revenue');
  });

  // Join admin rooms for plans management
  socket.on('join-plans-room', () => {
    socket.join('plans');
  });

  // Join overview room for real-time dashboard updates
  socket.on('join-overview-room', () => {
    socket.join('overview');
  });

  // Join progress room for real-time updates
  socket.on('join-progress-room', (userId) => {
    socket.join(`progress-${userId}`);
  });

  // Admin ban/unban user
  socket.on('ban-user', async (data) => {
    try {
      const { userId, banned } = data;
      await User.findByIdAndUpdate(userId, { isBanned: banned });
      io.to(`user_${userId}`).emit('banned', { message: banned ? 'Your account has been banned' : 'Your account has been unbanned' });
      if (banned) {
        io.in(`user_${userId}`).disconnectSockets();
      }
    } catch (error) {
      // Silent error handling
    }
  });

  socket.on('disconnect', () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('User disconnected:', socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));