const express = require("express");

const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const { getAllReviews, createReview } = reviewController;
const { protect, restrictTo } = authController;

const router = express.Router({
  mergeParams: true, //? allows us to use the :tourId parameter (coming from the tourRouter) in the reviewRouter
});

router
  .route("/")
  .get(getAllReviews)
  .post(protect, restrictTo("user"), createReview);

module.exports = router;
