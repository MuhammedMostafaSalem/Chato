const bcrypt = require("bcrypt");
const User = require("../models/userModels");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail");
const otpTemplate = require("../templates/otpTemplate");

// Verify OTP
const verifyOtp = async(otp) => {
    // Find a user whose OTP has not expired yet
    const user = await User.findOne({
        otpExpires: { $gt: Date.now() },
    }).select("+otp"); // Explicitly include OTP field

    // If no user is found, OTP is invalid or expired
    if (!user) {
        throw new ErrorHandler("Invalid or expired OTP");
    }

    // Compare the provided OTP with the hashed OTP stored in database
    const isMatch = await bcrypt.compare(otp, user.otp);

    // If OTP does not match, throw an error
    if (!isMatch) {
        throw new ErrorHandler("Invalid OTP");
    }

    // Prevent verifying an already verified user
    if (user.isVerified) {
        throw new ErrorHandler("User already verified");
    }

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpResendTimeout = undefined;

    await user.save();

    return user;
}

// Resend OTP
const resendOtp = async(phoneNumber) => {
    // Find user by phone number
    const user = await User.findOne({ phoneNumber });

    // If user does not exist
    if (!user) {
        throw new ErrorHandler("User not found", 404);
    }

    // If user is already verified, no need to resend OTP
    if (user.isVerified) {
        throw new ErrorHandler("User is already verified", 400);
    }

    // Prevent OTP spam by checking resend timeout
    if (user.otpResendTimeout && user.otpResendTimeout > Date.now()) {
        const secondsLeft = Math.ceil((user.otpResendTimeout - Date.now()) / 1000);
        throw new ErrorHandler(
            `Please wait ${secondsLeft} seconds before requesting a new OTP`,
            429
        );
    }

    // Generate new OTP and update resend timeout
    const otp = await user.generateOtp();
    await user.save();

    // Send OTP via email
    await sendEmail({
        email: user.email,
        subject: 'Resend OTP - Chato App',
        message: `Your new OTP is ${otp}. It is valid for 10 minutes.`,
        html: otpTemplate(user.username, otp),
    });

    return true;
}

module.exports = {
    verifyOtp,
    resendOtp
}