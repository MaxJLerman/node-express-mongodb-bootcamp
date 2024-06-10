const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("../controllers/handlerFactory");

exports.getAllReviews = catchAsync(async (request, response, next) => {
  let filter = {}; //? base filter, finds all tours

  if (request.params.tourId) {
    filter = { tour: request.params.tourId }; //? filters out all tours that don't match the tourId (if provided)
  }

  const reviews = await Review.find(filter);

  response.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.setTourUserId = (request, response, next) => {
  //* allow nested routes
  if (!request.body.tour) request.body.tour = request.params.tourId;
  if (!request.body.user) request.body.user = request.user.id;

  next();
};

exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
