const asyncWrapper = require("../middlewares/asyncWrapper");
const User = require("../models/userModels");
const sendEmail = require("../utils/sendEmail");
const ErrorHandler = require("../utils/errorHandler");
const { verifyOtp, resendOtp } = require("../services/otpService");
const sendToken = require("../services/sendToken");
const jwt = require("jsonwebtoken");
const verifyEmailTemplate = require("../templates/verifyEmailTemplate");

// Registration logic will go here
const register = asyncWrapper(async (req, res, next) => {
    // Extract user details from request body
    const { username, email, phoneNumber, password } = req.body;

    // add user to database
    const newUser = new User({
        username,
        email,
        phoneNumber,
        password,
    });

    // Generate OTP for email verification
    const otp = await newUser.generateOtp("email_verification");
    await newUser.save();

    // Send verification email with OTP
    await sendEmail({
        email: newUser.email,
        subject: 'Verify your email - Chato App',
        message: `Your OTP for email verification is: ${otp}. It is valid for 10 minutes.`,
        html: verifyEmailTemplate(newUser.username, otp),
    });

    // Send success response
    res.success('otp sent to your email for verification', 200);
});

// verify account logic will go here
const verifyAccountOtp = asyncWrapper(async (req, res, next) => {
    // Extract OTP from request body
    const { otp, purpose } = req.body;

    // Validate OTP
    if (!otp) return next(new ErrorHandler("OTP is required", 400));

    // Verify OTP using service layer
    const user = await verifyOtp(otp, purpose);

    let message;
    if (purpose === "email_verification") {
        message = "User verified successfully";
    }
    if (purpose === "forgot_password") {
        message = "OTP verified, you can reset your password now";
    }

    // Send success response
    res.success({
        message,
        username: user.username
    }, 200);
});

// resend account otp logic will go here
const resendAccountOtp = asyncWrapper(async (req, res, next) => {
    // Extract phoneNumber from request body
    const { phoneNumber, purpose } = req.body;

    // Validate phone number input
    if (!phoneNumber) {
        return next(new ErrorHandler("Phone number is required", 400));
    }

    // Resend OTP using service layer
    await resendOtp(phoneNumber, purpose);

    let message;
    if (purpose === "email_verification") {
        message = "Verification OTP resent successfully";
    }
    if (purpose === "forgot_password") {
        message = "Password reset OTP resent successfully";
    }

    // Send success response
    res.success(message, 200);
});

// Loging logic will go here
const login = asyncWrapper(async (req, res, next) => {
    // Extract phoneNumber and password from request body
    const { phoneNumber, password } = req.body;

    // Find user by phoneNumber and include password field
    const user = await User.findOne({ phoneNumber }).select("+password")

    // If user not found, return error
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Check if user is verified
    if (!user.isVerified) {
        return next(new ErrorHandler("Please verify your account first", 403));
    }

    // Compare provided password with stored hashed password
    const isMatch = await user.comparePassword(password);
    // If password does not match, return error
    if (!isMatch) {
        return next(new ErrorHandler("Password is incorrect", 400));
    }

    // If login is successful, send tokens
    sendToken(user, 200, res)
});

// Refresh token logic here
const refreshToken = asyncWrapper(async (req, res, next) => {
    // Get refresh token from cookies
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        return next(new ErrorHandler("Please login again", 401));
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user and check if refresh token matches
    const user = await User.findById(decoded.id);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Generate new access token
    const newAccessToken = user.generateAccessToken();

    // Send new access token
    res.success({ accessToken: newAccessToken }, 200);
});

// Forgot password logic here
const forgotPassword = asyncWrapper(async (req, res, next) => {
    // Extract phoneNumber from request body
    const { phoneNumber } = req.body;

    // Resent OTP using service layer
    await resendOtp(phoneNumber, "forgot_password");

    // Respond to the client
    res.success('OTP sent to your email for reset password', 200);
});

// Reset password logic here
const resetPassword = asyncWrapper(async (req, res, next) => {
    // Extract phoneNumber, password and confirm password from request body
    const { phoneNumber, password } = req.body;

    // Find user by phoneNumber
    const user = await User.findOne({ phoneNumber });

    // If user not found, return error
    if (!user) return next(new ErrorHandler("User not found", 400));

    // clear password and OTP fields
    user.password = password;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    // Send success response
    res.success("Reset password successfully.", 200);
});

// Logout logic here
const logout = asyncWrapper(async (req, res, next) => {
    // Cookie settings (Security Options)
    const cookieOptions = {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    }

    // Clear refresh token cookie
    res.clearCookie("refreshToken", cookieOptions);

    // Send success response
    res.success("Logged out successfully", 200);
});

module.exports = {
    register,
    verifyAccountOtp,
    resendAccountOtp,
    login,
    refreshToken,
    forgotPassword,
    resetPassword,
    logout
};