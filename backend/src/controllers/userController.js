const asyncWrapper = require("../middlewares/asyncWrapper");
const User = require("../models/userModels");
const ErrorHandler = require("../utils/errorHandler");

// get user profile logic will go here
const getUserProfile = asyncWrapper(async (req, res, next) => {
    // Extract user ID from req.user
    const userId = req.user.id;

    // Find user data from database using user ID
    const user = await User.findById(userId);

    // Send success response
    res.success({ user }, 200);
});

module.exports = {
    getUserProfile
};