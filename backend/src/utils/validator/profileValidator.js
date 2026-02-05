const ErrorHandler = require("../errorHandler");

const validateUpdateProfile = (req, res, next) => {
    const allowedUpdates = ["username", "email", "phoneNumber", "bio"];
    const bodyKeys = Object.keys(req.body || {});

    // Check if the body is empty and if there is no uploaded file
    if (bodyKeys.length === 0 && !req.file) return next(new ErrorHandler("No data provided for update", 400));

    // Make sure all fields are allowed.
    const isValid = bodyKeys.every((key) =>
        allowedUpdates.includes(key)
    );

    if (!isValid) return next(new ErrorHandler("One or more fields are not allowed to be updated", 400));

    next();
}

module.exports = {
    validateUpdateProfile
}