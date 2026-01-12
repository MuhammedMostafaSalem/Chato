// Custom Error Handler Class
class ErrorHandler extends Error {
    // Initialize with message and status code
    constructor(message, statusCode) {
        super(message); // Pass message to the Error constructor
        this.statusCode = statusCode; // Set the status code
        this.message = message; // Set the message
        
        // Capture the stack trace for better debugging
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorHandler;