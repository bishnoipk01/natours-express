const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // operational, trusted error, send response to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // programming unknown error, don't send response to client
    // log to console
    console.error('Error..', err);
    // send generic message to client
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong..!!'
    });
  }
};
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const invalidTokenError = () =>
  new AppError('Invalid token..please login again', 401);

const TokenExpiredError = () =>
  new AppError('login token expired..please login again', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);
  else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = invalidTokenError();
    if (err.name === 'TokenExpiredError') err = TokenExpiredError();

    sendErrorProd(err, res);
  }
};
