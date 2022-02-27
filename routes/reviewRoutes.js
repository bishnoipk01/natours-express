const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const Router = express.Router({ mergeParams: true });

// validate user before any of the following routes
Router.use(authController.validateUser);

Router.route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.validateUser,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.newReview
  );

Router.route('/:id')
  .get(reviewController.getReviewById)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = Router;
