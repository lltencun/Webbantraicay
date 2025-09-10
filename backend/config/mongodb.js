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
      // Attempt to reconnect on error
      setTimeout(() => {
        connect(5, 5000);
      }, 5000);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB Connection Disconnected");
      // Attempt to reconnect on disconnection
      setTimeout(() => {
        connect(5, 5000);
      }, 5000);
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    const connect = async (retries = 5, delay = 5000) => {
      console.log(`Attempting to connect to MongoDB (${retries} retries left)...`);
      try {
        // Close any existing connections
        if (mongoose.connection.readyState !== 0) {
          await mongoose.connection.close();
        }

        await mongoose.connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 30000,
          socketTimeoutMS: 60000,
          maxPoolSize: 10,
          minPoolSize: 5,
          retryWrites: true,
          w: 'majority',
          connectTimeoutMS: 30000,
          keepAlive: true,
          keepAliveInitialDelay: 300000,
          autoIndex: true,
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