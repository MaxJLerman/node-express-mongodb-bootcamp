const express = require("express");

const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const {
  getAllReviews,
  setTourUserId,
  createReview,
  updateReview,
  deleteReview,
} = reviewController;
const { protect, restrictTo } = authController;

const router = express.Router({
  mergeParams: true, //? allows us to use the :tourId parameter (coming from the tourRouter) in the reviewRouter
});

router
  .route("/")
  .get(getAllReviews)
  .post(protect, restrictTo("user"), setTourUserId, createReview);

router.route("/:id").patch(updateReview).delete(deleteReview);

module.exports = router;
