const express = require("express");

const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("../routes/reviewRoutes");

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

const router = express.Router(); //* middleware function created

router.use("/:tourId/reviews", reviewRouter); //? for this specific route, use reviewRouter instead of tourRouter

router.route("/top-5-cheap").get(aliasTopTours, getAllTours);

router.route("/tour-statistics").get(getTourStatistics);

router
  .route("/monthly-plan/:year")
  .get(protect, restrictTo("admin", "lead-guide", "guide"), getMonthlyPlan);

//* neither GET (all) or POST requests need an id parameter, so can be chained together like so:
router
  .route("/")
  .get(getAllTours)
  .post(protect, restrictTo("admin", "lead-guide"), createTour);

//* rest of the headers do need an id parameter, so can be chained together like so:
router
  .route("/:id")
  .get(getOneTour)
  .patch(protect, restrictTo("admin", "lead-guide"), updateTour)
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;
