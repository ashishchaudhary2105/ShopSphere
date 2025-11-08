    import mongoose from "mongoose";
    import { Schema } from "mongoose";
    export const addressSchema = new Schema(
    {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
    },
    { _id: false }
    );
    const userSchema = new Schema(
    {
        username: {
        type: String,
        required: true,
        },
        email: {
        type: String,
        required: true,
        unique: true,
        },
        address: [addressSchema],
        password: {
        type: String,
        required: true,
        },
        role: {
        type: String,
        enum: ["user", "seller", "admin"],
        required: true,
        default: "user",
        },
    },
    { timestamps: true }
    );
    export const User = mongoose.model("User", userSchema);
