const express = require("express");

const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const {
  getAllReviews,
  getOneReview,
  setTourUserId,
  createReview,
  updateReview,
  deleteReview,
} = reviewController;
const { protect, restrictTo } = authController;

const router = express.Router({
  mergeParams: true, //? allows us to use the :tourId parameter (coming from the tourRouter) in the reviewRouter
});

router.use(protect);

router
  .route("/")
  .get(getAllReviews)
  .post(restrictTo("user"), setTourUserId, createReview);

router
  .route("/:id")
  .get(getOneReview)
  .patch(restrictTo("user", "admin"), updateReview)
  .delete(restrictTo("user", "admin"), deleteReview);

module.exports = router;
