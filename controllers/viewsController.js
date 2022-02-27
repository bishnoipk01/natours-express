const Tour = require('../models/tourModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) return next(new AppError('No tour found with that name', 404));

  res
    .status(200)
    .set({
      'Content-Security-Policy':
        "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;",
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless'
    })
    .render('tour', {
      title: `${tour.name} Tour`,
      tour
    });
});

exports.loginForm = (req, res) => {
  res
    .status(200)
    .set({
      'Content-Security-Policy': "connect-src 'self' http://127.0.0.1:8000/",
      'Cross-Origin-Embedder-Policy': 'credentialless'
    })
    .render('login', {
      title: 'login'
    });
};

exports.signupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'signup'
  });
};

exports.userAccount = (req, res, next) => {
  if (res.locals.user)
    return res.status(200).render('user', {
      title: res.locals.user.name
    });

  return next(
    new AppError(
      'You are not logged in..Please log in to access this page.',
      404
    )
  );
};
