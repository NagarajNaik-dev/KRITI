const mongoose = require('mongoose');

// Connect to MongoDB if a URI is configured.
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('MongoDB URI not configured. Continuing without database connection.');
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.warn('Continuing without MongoDB. Authentication and interview routes will be unavailable until the database is reachable.');
  }
};

module.exports = connectDB;
