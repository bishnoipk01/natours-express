const User = require('../models/userModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./factoryController');

const filterObj = (obj, ...fields) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (fields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) don't allow password updates
  if (req.body.password || req.body.passwordMatch)
    return next(
      new AppError('updating password not allowed.. visit /resetMyPassword')
    );
  // 2) filter out unauthorized fields
  const updatedObj = filterObj(req.body, 'name', 'email', 'username');
  // 3) update document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, updatedObj, {
    runValidators: true,
    new: true
  });

  // 4) send response to client
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // 1) get the user and confirm password
  const { user } = req;
  const userDelete = await User.findById(user._id).select('+password');
  if (!(await user.checkPassword(req.body.password, userDelete.password)))
    return next(new AppError('Incorrect password..cannot delete user'));
  // 2) set the active state to false
  user.active = false;
  user.save({ validateBeforeSave: false });
  // 3) send response to client
  res
    .status(204)
    .json({ status: 'success', message: 'user deleted successfully!' });
});

exports.newUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead'
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = factory.getAll(User);

exports.deleteUser = factory.deleteOne(User);
exports.getUserById = factory.getOne(User);

// DON"T update PASSWORD using this!
exports.updateUser = factory.updateOne(User);
