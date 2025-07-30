import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import errorHandler from './utils/errorHandler.js';
import cors from 'cors';

// Load env vars
dotenv.config({ path: './.env' });

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: [
    'http://localhost:9002', // Seu frontend Next.js local
    'https://6000-firebase-studio-1753837305674.cluster-4xpux6pqdzhrktbhjf2cumyqtg.cloudworkstations.dev', // Sua Cloud Workstation
    'https://shop.yxznet.com/' 
  ],
  credentials: true,
}));

// Mount routers
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});