const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");
const asyncWrapper = require("./asyncWrapper");
const User = require("../models/userModels");

// Middleware to protect routes
const protectUser = asyncWrapper(async (req, res, next) => {
    let token;
    const authHeader = req.headers["Authorization"] || req.headers["authorization"];

    // Check Authorization header
    if (authHeader && authHeader.startsWith("Bearer "))
        token = authHeader.split(" ")[1];

    // If there are no tokens
    if (!token) return next(new ErrorHandler("Unauthorized. Please login to access this resource.", 401));

    // Verify token(errors handled by global error middleware)
    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Get user from database
    const user = await User.findById(decodedToken.id);

    // If user not found
    if (!user) return next(new ErrorHandler("User not found", 404));

    // Attach user to request
    req.user = user;

    next();
});

module.exports = protectUser;