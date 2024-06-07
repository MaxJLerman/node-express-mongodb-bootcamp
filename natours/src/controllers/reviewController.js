const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllReviews = catchAsync(async (request, response, next) => {
  const reviews = await Review.find();

  response.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (request, response, next) => {
  const newReview = await Review.create(request.body); //? any fields not in the schema but included in the request will be ignored

  response.status(201).json({
    status: "success",
    data: {
      review: newReview,
    },
  });
});
