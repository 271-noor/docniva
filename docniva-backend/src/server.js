// .env file ke variables ko load kar raha hai
// Jaise PORT, MONGO_URI, JWT_SECRET etc.
import "dotenv/config";




// Express application import
import app from "./app.js";

// MongoDB connection function import
import connectDB from "./config/db.js";


// ========================================
// SERVER PORT
// ========================================

// .env me PORT available hai to use karega
// Otherwise 5000 use karega
const PORT = process.env.PORT || 5000;


// ========================================
// START SERVER
// ========================================

const startServer = async () => {
  try {

    // Sabse pehle MongoDB connect hoga
    await connectDB();

    // Database connection successful hone ke baad
    // Express server start hoga
    app.listen(PORT, () => {
      console.log(
        `DocNiva backend running on port ${PORT}`
      );
    });

  } catch (error) {

    // Unexpected server error
    console.error(
      "Server failed to start:",
      error.message
    );

    process.exit(1);
  }
};


// Server start
startServer();