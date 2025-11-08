import { User } from "../models/user.model.js";
import mongoose from "mongoose";

// Get user profile (username, email, address)
export const getUser = async (req, res) => {
    try {
        const userId =  req.id; // Allow admins to view other users
        
        // Check if the requested user is the same as logged-in user or if admin
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this user profile'
            });
        }

        const user = await User.findById(userId)
            .select('username email address role createdAt updatedAt');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user information'
        });
    }
}

// Update user (only username and address)
export const updateUser = async (req, res) => {
    try {
        const userId = req.id ;
        const { username, address } = req.body;

        // Validate that only the owner or admin can update
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to update this user'
            });
        }

        // Validate input
        if (!username && !address) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields provided for update'
            });
        }

        // Prepare update object
        const updateData = {};
        if (username) updateData.username = username;
        if (address) updateData.address = address;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('username email address role createdAt updatedAt');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });

    } catch (error) {
        console.error('Error updating user:', error);
        
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
}

// Delete user
// export const deleteUser = async (req, res) => {
//     try {
//         const userId = req.params.id || req.user._id;

//         // Only allow users to delete themselves or admins to delete any user
//         if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Unauthorized to delete this user'
//             });
//         }

//         // Prevent admin from deleting themselves
//         if (userId === req.user._id.toString() && req.user.role === 'admin') {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Admins cannot delete their own accounts'
//             });
//         }

//         const deletedUser = await User.findByIdAndDelete(userId)
//             .select('username email role');

//         if (!deletedUser) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'User not found'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: 'User deleted successfully',
//             data: deletedUser
//         });

//     } catch (error) {
//         console.error('Error deleting user:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to delete user'
//         });
//     }
// }