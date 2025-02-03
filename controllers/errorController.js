const AppError = require('../utils/appError');

const handleDatabseIDErr = (err) => {
  const message = `Invalid ${err.path} ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsErr = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErr = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: Send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: Don't leak error details
  } else {
    // 1) Log error
    console.log('Error', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  // Express already knows this is an error handling middleware because of the 4 parameters
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
    
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, name: err.name };

    // Handling Invalid Database IDs
    if (error.name === 'CastError') error = handleDatabseIDErr(error);

    // Handling Duplicate Database Fields
    if (error.code === 11000) error = handleDuplicateFieldsErr(error);

    // Handling Mongoose Validation Error
    if (error.name === 'ValidationError') error = handleValidationErr(error);

    sendErrorProd(error, res);
  }
};
