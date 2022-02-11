const Review = require('../models/reviewModel');
const factory = require('./factoryController');
const catchAsync = require('../utils/catchAsync');

exports.setTourUserIds = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
});

exports.getAllReviews = factory.getAll(Review);
exports.newReview = factory.createOne(Review);
exports.getReviewById = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
