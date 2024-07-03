import { NextFunction, Request, Response } from "express";

import Tour from "@models/tourModel";
import catchAsync from "@utils/catchAsync";

export const getOverview = catchAsync(
  async (_request: Request, response: Response, _next: NextFunction) => {
    const tours = await Tour.find();

    response.status(200).render("overview", {
      title: "All Tours",
      tours,
    });
  },
);

export const getTour = catchAsync(
  async (request: Request, response: Response, _next: NextFunction) => {
    const tour = await Tour.findOne({ slug: request.params["slug"] }).populate({
      path: "reviews",
      // @ts-ignore
      fields: "review rating user", //! return later
    });

    response.status(200).render("tour", {
      title: `${tour!.name} Tour`,
      tour,
    });
  },
);
