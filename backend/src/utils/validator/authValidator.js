const ErrorHandler = require("../errorHandler");

const validateLogin = (req, res, next) => {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber) {
        return next(new ErrorHandler("Phone number is required", 400));
    } else if (!password) {
        return next(new ErrorHandler("Password is required", 400));
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
        return next(new ErrorHandler("Invalid phone number format", 400));
    }

    if (password.length < 6) {
        return next(new ErrorHandler("Password must be at least 6 characters", 400));
    }

    next();
}

const validateForgotPassword = (req, res, next) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return next(new ErrorHandler("Phone number is required", 400));
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
        return next(new ErrorHandler("Invalid phone number format", 400));
    }

    next();
}

const validateResetPassword = (req, res, next) => {
    const { phoneNumber, password, confirmPassword } = req.body;

    // Required fields
    if (!phoneNumber) return next(new ErrorHandler("phoneNumber is required", 400));
    if (!password) return next(new ErrorHandler("password is required", 400));
    if (!confirmPassword) return next(new ErrorHandler("confirm password is required", 400));

    // Password and confirmPassword length validation
    if (password.length < 6 || password.length > 20)
        return next(new ErrorHandler("Password must be between 6 and 20 characters", 400));
    if (confirmPassword.length < 6 || confirmPassword.length > 20)
        return next(new ErrorHandler("Confirm password must be between 6 and 20 characters", 400));

    // Password match
    if (password !== confirmPassword) return next(new ErrorHandler("Passwords do not match", 400));

    // Phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) return next(new ErrorHandler("Invalid phone number format", 400));

    next();
}

module.exports = {
    validateLogin,
    validateForgotPassword,
    validateResetPassword
};