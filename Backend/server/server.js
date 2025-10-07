const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/schedules', require('./routes/scheduleRoutes'));
app.use('/api/doselogs', require('./routes/doseLogRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.use('/api/chatbot', require('./routes/chatbotRoutes'));

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});