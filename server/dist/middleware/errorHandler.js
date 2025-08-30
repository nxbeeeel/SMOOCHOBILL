"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.createError = exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    console.error('Error:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(statusCode).json({
        error: {
            message: isDevelopment ? message : 'Something went wrong',
            ...(isDevelopment && { stack: error.stack }),
            statusCode
        },
        timestamp: new Date().toISOString()
    });
};
exports.errorHandler = errorHandler;
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
const notFound = (req, res, next) => {
    const error = (0, exports.createError)(`Route ${req.originalUrl} not found`, 404);
    next(error);
};
exports.notFound = notFound;
//# sourceMappingURL=errorHandler.js.map