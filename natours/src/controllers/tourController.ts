import { Request, Response, NextFunction } from "express";

import Tour from "@models/tourModel";
import catchAsync from "@utils/catchAsync";
import {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} from "@controllers/handlerFactory";
import AppError from "@utils/appError";
import { ITour } from "@schemas/tour.schema";

export const aliasTopTours = async (
  request: Request,
  _response: Response,
  next: NextFunction,
) => {
  request.query["limit"] = "5";
  request.query["sort"] = "-ratingsAverage,price";
  request.query["fields"] = "name,price,ratingsAverage,summary,difficulty";

  next();
};

export const getAllTours = getAll<ITour>(Tour);
export const getOneTour = getOne<ITour>(Tour, { path: "reviews" });
export const createTour = createOne<ITour>(Tour);
export const updateTour = updateOne<ITour>(Tour);
export const deleteTour = deleteOne<ITour>(Tour);

export const getTourStatistics = catchAsync(
  async (_request: Request, response: Response, _next: NextFunction) => {
    const statistics = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: "$difficulty" },
          numberOfTours: { $sum: 1 },
          numberOfRatings: { $sum: "$ratingsQuantity" },
          averageRating: { $avg: "$ratingsAverage" },
          averagePrice: { $avg: "$price" },
          minimumPrice: { $min: "$price" },
          maximumPrice: { $max: "$price" },
        },
      },
      {
        $sort: { averagePrice: 1 },
      },
    ]);

    response.status(200).json({
      status: "success",
      data: {
        statistics,
      },
    });
  },
);

export const getMonthlyPlan = catchAsync(
  async (request: Request, response: Response, _next: NextFunction) => {
    const year = parseInt(request.params["year"] as string, 10);

    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates", //? for each tour document, create a duplicate document each with only of the startDates in the array (removing the one document with one array of startDates)
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" }, //? groups the response objects by the month
          numberOfTourStarts: { $sum: 1 }, //? for each of the documents (tours) that goes through the pipeline, 1 is added to the "numberOfTourStarts" counter
          tours: { $push: "$name" }, //? creates an array of the tours taking place in the respective month
        },
      },
      {
        $addFields: { month: "$_id" }, //? creates a new field with the same value as _id in each document
      },
      {
        $project: {
          _id: 0, //? hides this property in each document in the response
        },
      },
      {
        $sort: { numberOfTourStarts: -1 }, //? sort by descending order
      },
      {
        $limit: 12, //? not needed in this case, but is present for reference
      },
    ]);

    response.status(200).json({
      status: "success",
      data: {
        plan,
      },
    });
  },
);

export const getToursWithin = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const distance = request.params["distance"] as string;
    const latitudelongitude = request.params["latitudelongitude"] as string;
    const unit = request.params["unit"] as string;

    const [latitude, longitude] = latitudelongitude!.split(",");

    unit !== "mi" && unit !== "km"
      ? next(
          new AppError(
            "Unit must either be miles (mi) or kilometers (km)",
            400,
          ),
        )
      : null;

    //? radius in radians
    const radius =
      unit === "mi"
        ? parseInt(distance, 10) / 3963.2
        : parseInt(distance, 10) / 6378.1;

    if (!latitude || !longitude) {
      next(
        new AppError(
          "Provide latitude amd longitude in the format: latitude,longitude",
          400,
        ),
      );
    }

    const tours = await Tour.find({
      startLocation: {
        $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
      },
    });

    response.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        data: tours,
      },
    });
  },
);

export const getDistances = catchAsync(async (request, response, next) => {
  const latitudelongitude = request.params["latitudelongitude"];
  const unit = request.params["unit"];
  const [latitude, longitude] = latitudelongitude!.split(",");

  unit !== "mi" && unit !== "km"
    ? next(
        new AppError("Unit must either be miles (mi) or kilometers (km)", 400),
      )
    : null;

  const multiplier = unit === "mi" ? 0.000621371 : 0.001; //? converts from default meters to miles/kilometers

  if (!latitude || !longitude) {
    next(
      new AppError(
        "Provide latitude and longitude in the format: latitude,longitude",
        400,
      ),
    );
  }

  //* performing calculation, use aggregation pipeline (middleware)
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [
            parseInt(longitude as string, 10),
            parseInt(latitude as string, 10),
          ],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        //? only display the following fields in the response
        distance: 1,
        name: 1,
      },
    },
  ]);

  response.status(200).json({
    status: "success",
    data: {
      data: distances,
    },
  });
});
