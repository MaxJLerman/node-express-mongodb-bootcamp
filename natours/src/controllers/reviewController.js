const Review = require("../models/reviewModel");
const factory = require("../controllers/handlerFactory");

exports.setTourUserId = (request, response, next) => {
  //* allow nested routes
  if (!request.body.tour) request.body.tour = request.params.tourId;
  if (!request.body.user) request.body.user = request.user.id;

  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getOneReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
