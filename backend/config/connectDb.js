import mongoose from "mongoose";

export const connectDb = async () => {
  const MONGO_URL = process.env.MONGO_URL;
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to the database successfully");
  } catch (e) {
    console.error("Error connecting to the database:", e.message || e);
  }
};
