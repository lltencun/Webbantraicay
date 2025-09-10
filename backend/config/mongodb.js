import mongoose from "mongoose";
const connectDB = async () => {
  try {
    // Log the MongoDB URI (without sensitive data) for debugging
    const sanitizedUri = process.env.MONGODB_URI ? 
      process.env.MONGODB_URI.replace(/\/\/[^@]+@/, '//****:****@') : 
      'undefined';
    console.log('Attempting to connect to MongoDB with URI:', sanitizedUri);

    // Set up connection listeners
    mongoose.connection.on("connected", () => {
      console.log("MongoDB Connection Established");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB Connection Error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB Connection Disconnected");
    });

    // Connect with retries
    const connectWithRetry = async (retries = 5) => {
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          maxPoolSize: 10
        });
        console.log("MongoDB Connected Successfully");
      } catch (error) {
        if (retries > 0) {
          console.log(`Connection failed, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          return connectWithRetry(retries - 1);
        }
        throw error;
      }
    };

    await connectWithRetry();
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    // Don't exit process in production, let the application handle it
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw error;
  }
};
export default connectDB;
