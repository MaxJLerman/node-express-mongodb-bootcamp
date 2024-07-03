import express from "express";

import {
  getAllReviews,
  getOneReview,
  setTourUserId,
  createReview,
  updateReview,
  deleteReview,
} from "@controllers/reviewController";
import { protect, restrictTo } from "@controllers/authController";

const reviewRouter = express.Router({
  mergeParams: true, //? allows us to use the :tourId parameter (coming from the tourRouter) in the reviewRouter
});

reviewRouter.use(protect);

reviewRouter
  .route("/")
  .get(getAllReviews)
  .post(restrictTo("user"), setTourUserId, createReview);

reviewRouter
  .route("/:id")
  .get(getOneReview)
  .patch(restrictTo("user", "admin"), updateReview)
  .delete(restrictTo("user", "admin"), deleteReview);

export default reviewRouter;
