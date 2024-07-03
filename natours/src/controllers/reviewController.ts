import { Request, Response, NextFunction } from "express";

import Review from "@models/reviewModel";
import {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} from "@controllers/handlerFactory";

export const setTourUserId = (
  request: Request,
  _response: Response,
  next: NextFunction,
) => {
  //* allow nested routes
  if (!request.body.tour) request.body.tour = request.params["tourId"];
  if (!request.body.user) request.body.user = (request as any).user.id; //! check this type

  next();
};

export const getAllReviews = getAll(Review);
export const getOneReview = getOne(Review);
export const createReview = createOne(Review);
export const updateReview = updateOne(Review);
export const deleteReview = deleteOne(Review);
