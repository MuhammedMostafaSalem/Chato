const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose duplicate key error
    if(err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `The ${field} '${err.keyValue[field]}' is already in use. Please choose another one.`;

        err = new ErrorHandler(message, statusCode);
    }
    
    // Mongoose validation error
    if(err.name === "ValidationError") {
        statusCode = 400;
        const messages = Object.values(err.errors).map(value => value.message);
        message = `${messages}`;

        err = new ErrorHandler(message, statusCode);
    }

    console.log(err);

    if (statusCode >= 400 && statusCode < 500) {
        res.fail(message, statusCode)
    } else {
        res.error(message, statusCode)
    }
}