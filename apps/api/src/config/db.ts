import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';

// Ensure public DNS resolver is used for MongoDB Atlas SRV lookups on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS cannot be configured in restricted environment
}

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️ Running server with retry on requests');
    }
  }
};
