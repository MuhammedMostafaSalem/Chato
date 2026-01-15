const bcrypt = require("bcrypt");
const User = require("../models/userModels");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail");
const verifyEmailTemplate = require("../templates/verifyEmailTemplate");
const forgotPasswordTemplate = require("../templates/forgotPasswordTemplate");

// Verify OTP
const verifyOtp = async (otp, purpose) => {
    // Find a user whose OTP has not expired yet
    const user = await User.findOne({
        otpPurpose: purpose,
        otpExpires: { $gt: Date.now() },
    }).select("+otp"); // Explicitly include OTP field

    // If no user is found, OTP is invalid or expired
    if (!user) {
        throw new ErrorHandler("Invalid or expired OTP", 400);
    }

    // Compare the provided OTP with the hashed OTP stored in database
    const isMatch = await bcrypt.compare(otp, user.otp);

    // If OTP does not match, throw an error
    if (!isMatch) {
        throw new ErrorHandler("Invalid OTP", 400);
    }

    // Email verification
    if (purpose === "email_verification") {
        // Prevent verifying an already verified user
        if (user.isVerified) {
            throw new ErrorHandler("User already verified", 400);
        }
        // Mark user as verified
        user.isVerified = true;
    }

    // clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpResendTimeout = undefined;
    user.otpPurpose = undefined;

    await user.save();

    return user;
}

// Resend OTP
const resendOtp = async (phoneNumber, purpose) => {
    // Find user by phone number
    const user = await User.findOne({ phoneNumber });

    // If user does not exist
    if (!user) {
        throw new ErrorHandler("User not found", 404);
    }

    // If user is already verified, no need to resend OTP
    if (purpose === "email_verification" && user.isVerified) {
        throw new ErrorHandler("User already verified", 400);
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
    const otp = await user.generateOtp(purpose);
    await user.save();

    // Send OTP via email
    await sendEmail({
        email: user.email,
        subject: purpose === "forgot_password"
            ? "Reset Password OTP - Chato App"
            : "Verify Email OTP - Chato App",
        html: purpose === "forgot_password"
            ? forgotPasswordTemplate(user.username, otp)
            : verifyEmailTemplate(user.username, otp)
    });

    return true;
}

module.exports = {
    verifyOtp,
    resendOtp
}