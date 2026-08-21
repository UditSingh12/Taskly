import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';

// Ensure public DNS resolver is used for MongoDB Atlas SRV lookups on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS cannot be configured in restricted environment
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDB = async (): Promise<void> => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    }).then((mongoose) => {
      console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    }).catch((error) => {
      console.error('❌ Failed to connect to MongoDB:', error);
      cached.promise = null;
      if (env.NODE_ENV === 'production') {
        process.exit(1);
      }
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};
