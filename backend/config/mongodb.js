import mongoose from "mongoose";
const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("DB Connected");
    });
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};
export default connectDB;
