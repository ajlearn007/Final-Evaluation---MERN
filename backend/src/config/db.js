const mongoose = require("mongoose");

const connectDB = async () => {
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    "mongodb+srv://backendUser:StrongPass123!@cluster0.4pxkpy7.mongodb.net/?appName=Cluster0";
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
