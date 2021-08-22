const Review = require("../Models/reviewModel");
// const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReviewById = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter);

  res.status(200).json({
    status: "success",
    tour: req.params.tourId || "All Tours",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.setTourUserIds = (req, res, next) => {
  // allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  // getting user ID from the protect middleware
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
