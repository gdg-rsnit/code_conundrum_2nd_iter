import mongoose from "mongoose";
import process from "process";

export const connectDB=async()=>{
    try {
        const db=await mongoose.connect(process.env.MONGO_URI || "")
        console.log("DB connected successfully")
    } catch (error) {
        console.log("databse connection failed:",error)
        process.exit(1)
    }
}