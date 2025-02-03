class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Error.captureStacktrace(this, this.constructor);
    // Capture stack trace if available
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
