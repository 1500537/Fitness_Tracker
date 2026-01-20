import express from "express";
import "dotenv/config";
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

connectDB()
connectCloudinary()

const app = express()
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    methods: ["GET", "POST"]
  }
});

app.use(cors()) //Enable Cross-Origin Resource Sharing

// Make io available to routes
app.set('io', io);



// Clerk Middleware
app.use(express.json())
app.use(clerkMiddleware())

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

app.get('/', (req, res) => res.send("API is working..."))

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user-specific room for real-time updates
  socket.on('join-user-room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
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

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));