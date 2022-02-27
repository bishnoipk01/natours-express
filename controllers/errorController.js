const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const invalidTokenError = () =>
  new AppError('Invalid token..please login again', 401);

const TokenExpiredError = () =>
  new AppError('login token expired..please login again', 401);

const sendErrorDev = (err, req, res) => {
  // send error stack if error occurred in api routes
  if (req.originalUrl.startsWith('/api'))
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });

  // render error template if error occurred in view routes
  console.error('some error occurred', err);
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  // A) API error
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      // operational, trusted error, send response to client
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // programming unknown error, don't send response to client
    // log to console
    console.error('Error occurred..', err);
    // send generic message to client
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong..!!'
    });
  }
  // B) rendered website
  // 1) Operational trusted error, send message to client
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'something went wrong!',
      msg: err.message
    });
  }
  // 2) Programming error or unknown error, don't leak info  to client
  console.log('error occured');
  // send a generic error message
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: 'Please try again later.'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (process.env.NODE_ENV === 'development') sendErrorDev(err, req, res);
  else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = invalidTokenError();
    if (err.name === 'TokenExpiredError') err = TokenExpiredError();

    sendErrorProd(err, req, res);
  }
};
