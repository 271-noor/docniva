// Mongoose import kar rahe hain
// MongoDB ke saath connection aur database operations ke liye
import mongoose from "mongoose";


// ========================================
// DATABASE CONNECTION
// ========================================

const connectDB = async () => {
  try {
    // .env se MongoDB connection URL lekar
    // MongoDB se connect kar rahe hain
    await mongoose.connect(process.env.MONGO_URI);

    // Connection successful hone par message
    console.log("MongoDB connected successfully");

  } catch (error) {
    // Agar MongoDB connection fail ho jaye
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    // Server ko stop kar denge
    // Kyunki database ke bina backend properly kaam nahi karega
    process.exit(1);
  }
};


// server.js me use karne ke liye export
export default connectDB;