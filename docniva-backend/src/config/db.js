import mongoose from "mongoose";

// Query injection se bachata hai ($ia operators ko plain value maan leta hai)
mongoose.set("sanitizeFilter", true);

// Schema me na likhe fields ke queries ignore ho jayein
mongoose.set("strictQuery", true);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // Atlas na mile to 10 sec me fail
      maxPoolSize: 10,
    });

    console.log("MongoDB connected successfully");

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB runtime error:", err.message);
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;