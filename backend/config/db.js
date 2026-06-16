const mongoose = require('mongoose');

// Connect to MongoDB using the URI specified in environment variables
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    // Exit process with failure code if connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
