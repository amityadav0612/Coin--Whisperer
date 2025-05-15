import mongoose from 'mongoose';

// Default MongoDB connection string (local for development)
// For Replit, we'll use MongoDB Atlas (you need to set MONGODB_URI in environment)
// This would look like: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/coinWhisperer
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB 
export async function connectToDatabase() {
  if (!MONGODB_URI) {
    console.warn('No MongoDB connection string provided. Running in memory mode.');
    return;
  }
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.warn('Running in memory mode due to MongoDB connection failure.');
  }
}

// Handle connection events  
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Close connection when Node process ends
process.on('SIGINT', async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
  }
  process.exit(0);
});

export default mongoose;