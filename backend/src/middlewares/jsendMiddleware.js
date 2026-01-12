const jsendMiddleware = (req, res, next) => {
    // Success response
    res.success = (data, statusCode) => {
        res.status(statusCode || 200).json({
            status: 'success',
            data
        });
    };

    // Fail response
    res.fail = (data, statusCode) => {
        res.status(statusCode || 400).json({
            status: 'fail',
            data
        });
    };

    // Error response
    res.error = (message, statusCode) => {
        res.status(statusCode || 500).json({
            status: 'error',
            message
        });
    };

    next();
}

module.exports = jsendMiddleware;