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

connectDB()
connectCloudinary()

const app = express()
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
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

app.get('/', (req, res) => res.send("API is working..."))

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user-specific room for real-time updates
  socket.on('join-user-room', async (userId) => {
    try {
      const user = await User.findById(userId);
      if (user && user.isBanned) {
        socket.emit('banned', { message: 'Your account has been banned' });
        socket.disconnect(true);
        console.log(`Banned user ${userId} attempted to connect`);
        return;
      }
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    } catch (error) {
      console.error('Error checking user ban status:', error);
      socket.disconnect(true);
    }
  });

  // Join admin rooms for workout management
  socket.on('join-workouts-room', () => {
    socket.join('workouts');
    console.log('Admin joined workouts room');
  });

  socket.on('join-categories-room', () => {
    socket.join('categories');
    console.log('Admin joined categories room');
  });

  // Join admin rooms for revenue management
  socket.on('join-revenue-room', () => {
    socket.join('revenue');
    console.log('Admin joined revenue room');
  });

  // Join admin rooms for plans management
  socket.on('join-plans-room', () => {
    socket.join('plans');
    console.log('Admin joined plans room');
  });

  // Join progress room for real-time updates
  socket.on('join-progress-room', (userId) => {
    socket.join(`progress-${userId}`);
    console.log(`User ${userId} joined progress room`);
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
      console.log(`User ${userId} ${banned ? 'banned' : 'unbanned'}`);
    } catch (error) {
      console.error('Error banning/unbanning user:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));