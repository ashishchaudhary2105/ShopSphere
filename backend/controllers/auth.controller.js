import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
dotenv.config();
export const signup = async (req, res) => {
  try {
    const { username, email, address, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const newUser = await User.create({
      username,
      email,
      address,
      password,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create account",
      error: error.message,
    });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (password !== user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    if (role !== user.role) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to sign in",
      error: error.message,
    });
  }
};
