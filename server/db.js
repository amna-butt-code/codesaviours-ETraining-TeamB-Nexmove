const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGO_URI?.trim();

  if (
    !mongoUri ||
    !/^mongodb(?:\+srv)?:\/\//i.test(mongoUri)
  ) {
    throw new Error(
      "MONGO_URI is missing or invalid. Check server/.env and use a mongodb:// or mongodb+srv:// connection string."
    );
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully!");

    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    // Important: the caller must know that the connection failed.
    throw error;
  }
}

module.exports = connectDB;