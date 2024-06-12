const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("../controllers/handlerFactory");
const AppError = require("../utils/appError");

exports.aliasTopTours = async (request, response, next) => {
  request.query.limit = "5";
  request.query.sort = "-ratingsAverage,price";
  request.query.fields = "name,price,ratingsAverage,summary,difficulty";

  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getOneTour = factory.getOne(Tour, { path: "reviews" });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStatistics = catchAsync(async (request, response, next) => {
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
});

exports.getMonthlyPlan = catchAsync(async (request, response, next) => {
  const year = request.params.year * 1;

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
});

exports.getToursWithin = catchAsync(async (request, response, next) => {
  const { distance, latitudelongitude, unit } = request.params;
  const [latitude, longitude] = latitudelongitude.split(",");

  //? radius in radians
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

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
});
