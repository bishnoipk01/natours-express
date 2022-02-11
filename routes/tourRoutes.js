const express = require('express');

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

const tourRouter = express.Router();

tourRouter.use('/:tourId/reviews', reviewRouter);

tourRouter
  .route('/top-5-cheap-tours')
  .get(tourController.aliasTopTours, tourController.getAllTours);

tourRouter.route('/tours-stats').get(tourController.getTourStats);
tourRouter
  .route('/monthly-plan/:year')
  .get(
    authController.validateUser,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.getMonthlyPlan
  );

tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi

tourRouter
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances);

tourRouter
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.validateUser,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.newTour
  );

tourRouter
  .route('/:id')
  .get(tourController.getTourById)
  .patch(
    authController.validateUser,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.validateUser,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = tourRouter;
