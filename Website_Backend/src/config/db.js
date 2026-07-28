import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config();


export const connectDB = async (res, req) => {
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URL)
        console.log(`MongoDB Connected via ${connect.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1); // Exit process with failure
    }
}