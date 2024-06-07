const express = require("express");

const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");

const {
  aliasTopTours,
  getAllTours,
  getOneTour,
  createTour,
  updateTour,
  deleteTour,
  getTourStatistics,
  getMonthlyPlan,
} = tourController;
const { protect, restrictTo } = authController;
const { createReview } = reviewController;

const router = express.Router(); //* middleware function created

router.route("/top-5-cheap").get(aliasTopTours, getAllTours);

router.route("/tour-statistics").get(getTourStatistics);

router.route("/monthly-plan/:year").get(getMonthlyPlan);

//* neither GET (all) or POST requests need an id parameter, so can be chained together like so:
router.route("/").get(protect, getAllTours).post(createTour);

//* rest of the headers do need an id parameter, so can be chained together like so:
router
  .route("/:id")
  .get(getOneTour)
  .patch(updateTour)
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

router
  .route("/:tourId/reviews")
  .post(protect, restrictTo("user"), createReview);

module.exports = router;
