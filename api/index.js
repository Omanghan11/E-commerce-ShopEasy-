import app from '../backend/server/src/server.js';
import { connectDB } from '../backend/server/src/db.js';

// Cache the database connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    cachedDb = await connectDB(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    return cachedDb;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// Vercel serverless function handler
export default async (req, res) => {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Handle the request with Express
    return app(req, res);
  } catch (error) {
    console.error('Error in serverless function:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
