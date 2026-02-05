const asyncWrapper = require("../middlewares/asyncWrapper");
const User = require("../models/userModels");
const ErrorHandler = require("../utils/errorHandler");
const { prepareUpdateData, handleAvatarUpdate, deleteAvatarFile } = require("../services/userService");

// get user profile logic will go here
const getUserProfile = asyncWrapper(async (req, res, next) => {
    // Extract user ID from req.user
    const userId = req.user.id;

    // Find user data from database using user ID
    const user = await User.findById(userId).select('-password');;

    // Send success response
    res.success({ user }, 200);
});

// Update user profile logic will go here
const updateProfile = asyncWrapper(async (req, res, next) => {
    const { id } = req.user;

    // Prepare the update data by filtering allowed fields from the request body
    const updateData = prepareUpdateData(req.body);

    // If no valid fields are provided for update, return an error response
    if (Object.keys(updateData).length === 0)
        return next(new ErrorHandler("No valid data provided for update", 400));

    // Update the user data in the database and return the updated user information
    const updatedUser = await User.findByIdAndUpdate(id, { $set: updateData }, {
        new: true,          // Returns data after update
        runValidators: true // Enabling validators in schema
    }).select('-password');

    // If the user is not found after the update, return a 404 error response
    if (!updatedUser) return next(new ErrorHandler("User not found", 404));

    // Send success response
    res.success({ user: updatedUser }, 200);
});

// Update user avatar logic will go here
const updateAvatar = asyncWrapper(async (req, res, next) => {
    const { id } = req.user;

    // Check if a file is uploaded
    if (!req.file) return next(new ErrorHandler("No avatar file uploaded", 400));

    // Find the user by ID to get the current avatar information for update
    const user = await User.findById(id);

    // Handle avatar update and get the new avatar path
    const avatarPath = handleAvatarUpdate(user, req.file, req);

    // Update the user's avatar field in the database
    user.avatar = avatarPath;
    await user.save();

    // Send success response
    res.success({ avatar: avatarPath }, 200);
});

// Delete user avatar logic will go here
const deleteAvatar = asyncWrapper(async (req, res, next) => {
    const { id } = req.user;

    // Find the user by ID to get the current avatar information for deletion
    const user = await User.findById(id);

    // Check if the user has an avatar to delete
    if(!user.avatar) return next(new ErrorHandler("No avatar to delete", 400));

    // Delete the avatar file from the server
    deleteAvatarFile(user);

    // Update the user's avatar field to null in the database
    user.avatar = null;
    await user.save();

    // Send success response
    res.success({ message: "Avatar deleted successfully" }, 200);
});

module.exports = {
    getUserProfile,
    updateProfile,
    updateAvatar,
    deleteAvatar
};