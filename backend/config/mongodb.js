import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from environment variables');
    }

    // Test URI format
    const uri = process.env.MONGODB_URI;
    if (!uri.includes('mongodb+srv://') && !uri.includes('mongodb://')) {
      throw new Error('Invalid MongoDB URI format');
    }

    // Log sanitized URI (hide credentials)
    const sanitizedUri = uri.replace(/\/\/[^@]+@/, '//****:****@');
    console.log('Attempting to connect to MongoDB:', sanitizedUri);

    // Set mongoose options
    mongoose.set('strictQuery', false);

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

    const connect = async (retries = 5, delay = 5000) => {
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 15000,
          socketTimeoutMS: 45000,
          maxPoolSize: 10,
          retryWrites: true,
          w: 'majority',
          connectTimeoutMS: 10000,
          serverApi: {
            version: '1',
            strict: true,
            deprecationErrors: true
          }
        });
        console.log("MongoDB Connected Successfully");
        return true;
      } catch (error) {
        console.error(`MongoDB connection error (${retries} attempts left):`, error.message);
        
        if (retries <= 0) {
          throw new Error(`Failed to connect to MongoDB after multiple attempts: ${error.message}`);
        }
        
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return connect(retries - 1, delay);
      }
    };

    try {
      await connect();
    } catch (error) {
      console.error("Fatal MongoDB connection error:", error.message);
      // In production, we'll let the application handle the error
      if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
      }
      throw error;
    }
  } catch (error) {
    console.error("MongoDB initialization error:", error.message);
    throw error;
  }
};

export default connectDB;