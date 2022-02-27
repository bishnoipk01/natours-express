const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const EmailService = require('../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  // generating JWT token
  const token = signToken(user._id);

  // sending JWT token as cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRATION * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  // sending response to client
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    role: req.body.role,
    password: req.body.password,
    passwordMatch: req.body.passwordMatch
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // check if user sent a email and password
  if (!email || !password)
    return next(new AppError('please provide email and password'));

  // getting user(if any) based on email provided
  const user = await User.findOne({ email }).select('+password');

  // checking for a vaid user and matching if password is correct
  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new AppError('Incorrect email or password'));

  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ status: 'success' });
};

exports.validateUser = catchAsync(async (req, res, next) => {
  // 1) getting token and checking if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) token = req.cookies.jwt;
  if (!token)
    return next(new AppError('you are not logged in..please login first', 401));
  // 2) verifacatiom of tokens
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  // 3) check if user still exists
  const currentUser = await User.findById(decodedToken.id);
  if (!currentUser) {
    return next(
      new AppError('the user belonging to this token does not exist')
    );
  }
  // 4) check if user changed password after token has issued
  if (currentUser.changedPassword(decodedToken.iat))
    return next(
      new AppError('User password has changed...please login again', 401)
    );

  req.user = currentUser;
  //GRANT ACCESS TO PROTECTED ROUTES
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPassword(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER

      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user email from posted query
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('no user exist with provided email', 404));
  // 2) generate password reset token
  const resetToken = user.resetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // 3) send reset token via email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  // creating options for email
  const options = {
    email: user.email,
    subject: 'Your password reset token. Valid for 10 mins',
    message: `Reset your password by following link:  \n ${resetURL} \n if you didn't requested to reset your password please ignore this email`
  };
  try {
    // sending email
    await EmailService(options);

    // send response to client
    res.status(200).json({
      status: 'success',
      message: 'Your reset token has been sent successfully to your email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    next(
      new AppError('there was an error sending email..try again later', 500)
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user by reset token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now()
    }
  });
  // 2) if the user exists set the new password
  if (!user)
    return next(new AppError('Token invalid or expired..Try again '), 401);
  // set new password
  user.password = req.body.password;
  user.passwordMatch = req.body.passwordMatch;
  // reset states of user
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.save();
  // 3) update the changedPasswordAt property
  // done via pre save mongoose schema update functionmethod
  // 4) login the user via JWT token
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get user from the collection
  const user = await User.findById(req.user._id).select('+password');
  // 2)check if posted current password is correct
  if (!(await user.checkPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('invalid current password try again..', 401));

  // 3 )if so update password
  user.password = req.body.password;
  user.passwordMatch = req.body.passwordMatch;
  await user.save();
  // 4) login user via JWT token
  createSendToken(user, 200, res);
});
