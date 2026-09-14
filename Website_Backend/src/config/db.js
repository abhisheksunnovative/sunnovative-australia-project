import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config();


export const connectDB = async (res, req) => {
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 60000,
            socketTimeoutMS: 120000,
            family: 4,
            maxPoolSize: 50
        });
        console.log(`MongoDB Connected via ${connect.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1); // Exit process with failure
    }
}