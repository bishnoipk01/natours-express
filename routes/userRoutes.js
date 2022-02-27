const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();

userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);
userRouter.get('/logout', authController.logout);

userRouter.post('/forgotPassword', authController.forgotPassword);
userRouter.patch('/resetPassword/:token', authController.resetPassword);

// authenticate user for all the following routes
userRouter.use(authController.validateUser);

userRouter.patch('/updateMyDetails', userController.updateMe);
userRouter.patch('/resetMyPassword', authController.updatePassword);
userRouter.delete('/deleteMe', userController.deleteMe);

userRouter.get('/me', userController.getMe, userController.getUserById);

userRouter.use(authController.restrictTo('admin'));
userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.newUser);
userRouter
  .route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
