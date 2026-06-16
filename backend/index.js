require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

// Initialize the Express app
const app = express();

// Connect to MongoDB
connectDB();

// Apply global middlewares
app.use(cors()); // Allow cross-origin requests from frontend (localhost:5173)
app.use(express.json()); // Parse JSON request bodies

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Book A Doctor API is running successfully.');
});

// Global error handling middleware (standard human-written style)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong on the server!' });
});

// Run server on specified PORT or fallback to 8000
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running in dev mode on http://localhost:${PORT}`);
});
