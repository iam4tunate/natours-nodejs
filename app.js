const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//! 1) MIDDLEWARE
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

//! 3) ROUTES
// This is where we mount our routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//! Unhandled Routes Middleware
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  // If the next function in Express receives an argument, it automatically identifies it as an error, skips all remaining middleware in the stack, and forwards the error to the global error-handling middleware for processing
});

//! Global Error Handling Middleware
app.use(globalErrorHandler); // handler exported from errorController

module.exports = app;
