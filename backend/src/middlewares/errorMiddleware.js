const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `The ${field} '${err.keyValue[field]}' is already in use. Please choose another one.`;

        err = new ErrorHandler(message, statusCode);
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        const messages = Object.values(err.errors).map(value => value.message);
        message = `${messages}`;

        err = new ErrorHandler(message, statusCode);
    }

    // Mongoose Cast error
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Resource not found. Invalid ${err.path}: ${err.value}`;

        err = new ErrorHandler(message, statusCode);
    }

    // JWT error
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        const message = "Invalid token. Please login again.";
        err = new Errorhandler(message, statusCode);
    }

    // JWT EXPIRE error
    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        const message = "Token expired. Please login again.";

        err = new Errorhandler(message, statusCode);
    }

    console.log(err);

    if (statusCode >= 400 && statusCode < 500) {
        res.fail(message, statusCode)
    } else {
        res.error(message, statusCode)
    }
}