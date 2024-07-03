import express from "express";

import {
  aliasTopTours,
  getAllTours,
  getOneTour,
  createTour,
  updateTour,
  deleteTour,
  getTourStatistics,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
} from "@controllers/tourController";
import { protect, restrictTo } from "@controllers/authController";
import reviewRouter from "@routes/reviewRoutes";

const tourRouter = express.Router(); //* middleware function created

tourRouter.use("/:tourId/reviews", reviewRouter); //? for this specific route, use reviewRouter instead of tourRouter

tourRouter.route("/top-5-cheap").get(aliasTopTours, getAllTours);

tourRouter.route("/tour-statistics").get(getTourStatistics);

tourRouter
  .route("/monthly-plan/:year")
  .get(protect, restrictTo("admin", "lead-guide", "guide"), getMonthlyPlan);

tourRouter
  .route("/tours-within/:distance/center/:latitudelongitude/unit/:unit")
  .get(getToursWithin);

tourRouter.route("/distances/:latitudelongitude/unit/:unit").get(getDistances);

//* neither GET (all) or POST requests need an id parameter, so can be chained together like so:
tourRouter
  .route("/")
  .get(getAllTours)
  .post(protect, restrictTo("admin", "lead-guide"), createTour);

//* rest of the headers do need an id parameter, so can be chained together like so:
tourRouter
  .route("/:id")
  .get(getOneTour)
  .patch(protect, restrictTo("admin", "lead-guide"), updateTour)
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

export default tourRouter;
