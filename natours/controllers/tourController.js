const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");

exports.aliasTopTours = async (request, response, next) => {
  request.query.limit = "5";
  request.query.sort = "-ratingsAverage,price";
  request.query.fields = "name,price,ratingsAverage,summary,difficulty";

  next();
};

exports.getAllTours = async (request, response) => {
  try {
    //* build query
    const features = new APIFeatures(Tour.find(), request.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query; //* execute built query

    response.status(200).json({
      status: "success",
      requestedAt: request.requestTime,
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

exports.getOneTour = async (request, response) => {
  try {
    const tour = await Tour.findById(request.params.id);

    response.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

exports.createTour = async (request, response) => {
  try {
    const newTour = await Tour.create(request.body);

    response.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    response.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.updateTour = async (request, response) => {
  try {
    const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    });

    response.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

exports.deleteTour = async (request, response) => {
  try {
    await Tour.findByIdAndDelete(request.params.id);

    response.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    response.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

exports.getTourStatistics = async (request, response) => {
  try {
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
  } catch (error) {
    response.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

exports.getMonthlyPlan = async (request, response) => {
  try {
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
  } catch (error) {
    response.status(404).json({
      status: "fail",
      message: error,
    });
  }
};
