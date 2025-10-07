const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://sumitagrawal9462_db_user:UM2BixLEWIxXUPoV@cluster0.8diylcy.mongodb.net/MedWellDB?retryWrites=true&w=majority&appName=Cluster0");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;