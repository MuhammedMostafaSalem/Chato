const asyncWrapper = require("../middlewares/asyncWrapper");
const User = require("../models/userModels");
const otpTemplate = require("../templates/otpTemplate");
const sendEmail = require("../utils/sendEmail");
const ErrorHandler = require("../utils/errorHandler");
const { verifyOtp, resendOtp } = require("../services/otpService");

// Registration logic will go here
const register = asyncWrapper(async (req, res, next) => {
    const { username, email, phoneNumber, password } = req.body;

    const newUser = new User({
        username,
        email,
        phoneNumber,
        password,
    });

    // Generate OTP for email verification
    const otp = await newUser.generateOtp();
    await newUser.save();

    // Send verification email with OTP
    await sendEmail({
        email: newUser.email,
        subject: 'Verify your email for Chato App',
        message: `Your OTP for email verification is: ${otp}. It is valid for 10 minutes.`,
        html: otpTemplate(newUser.username, otp),
    });

    // Respond to the client
    res.success('otp sent to your email for verification', 200);
});

// verify email logic will go here
const verifyEmailOtp = asyncWrapper(async (req, res, next) => {
    // Extract OTP from request body
    const {otp} = req.body;

    // Validate OTP
    if (!otp) {
        return next(new ErrorHandler("OTP is required", 400));
    }

    try {
        // Verify OTP using service layer
        const user = await verifyOtp(otp);

        // Send success response
        res.success({
            message: "User verified successfully",
            username: user.username
        }, 200);

    } catch (error) {
        // Forward service errors to global error handler
        return next(new ErrorHandler(error.message, 400));
    }
});

// resend email otp logic will go here
const resendEmailOtp = asyncWrapper(async (req, res, next) => {
    // Extract phoneNumber from request body
    const { phoneNumber } = req.body;

    // Validate phone number input
    if (!phoneNumber) {
        return next(new ErrorHandler("Phone number is required", 400));
    }

    // Resend OTP using service layer
    await resendOtp(phoneNumber);

    // Send success response
    res.success("OTP resent successfully", 200);
});

module.exports = {
    register,
    verifyEmailOtp,
    resendEmailOtp
};