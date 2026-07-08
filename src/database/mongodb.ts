import mongoose from "mongoose";
// Ensure this matches the export name in your config/index.ts
import { MONGODB_URI } from "../config";

export async function connectDatabase() {
    try {

        await mongoose.connect(MONGODB_URI);
        console.log("✅ Database connected successfully");
        console.log(`📍 URI: ${MONGODB_URI}`);

    } catch (error) {
        console.error("❌ Database connection failed!");
        console.error(error);
        process.exit(1); 
    }
}