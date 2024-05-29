const Tour = require("../models/tourModel");

//* no longer need the following two middleware functions, checks are handled by Mongoose Schema now
//* middleware function, so has access to "next", accepts id parameter so has access to "value" (value of id parameter)
exports.checkId = (request, response, next, value) => {
  const id = request.params.id * 1; //* converts string to number

  if (id > tours.length) {
    return response.status(404).json({
      status: "fail",
      message: "invalid ID",
    });
  }

  next();
};

//* middleware function, so has access to "next"
exports.checkBody = (request, response, next) => {
  if (!request.body.name || !request.body.price) {
    return response.status(400).json({
      status: "fail",
      message: "missing name or price",
    });
  }

  next();
};

exports.aliasTopTours = async (request, response, next) => {
  requ.query.limit = "5";
  request.query.sort = "-ratingsAverage,price";
  request.query.fields = "name,price,ratingsAverage,summary,difficulty";

  next();
};

exports.getAllTours = async (request, response) => {
  try {
    //* filtering out protected fields
    const queryObject = { ...request.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((element) => delete queryObject[element]);

    //* advanced filtering, adding MongoDB syntax $
    let queryString = JSON.stringify(queryObject);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );

    //* build query
    let query = Tour.find(JSON.parse(queryString));

    //* sorting
    if (request.query.sort) {
      const sortBy = request.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //* field limiting
    query = query.select("-__v"); //? firstly excluding the __v property provided by MongoDB
    if (request.query.fields) {
      const fields = request.query.fields.split(",").join(" ");
      query = query.select(fields);
    }

    //* pagination
    const page = request.query.page * 1 || 1;
    const limitAmount = request.query.limit * 1 || 100;
    const skipAmount = (page - 1) * limitAmount;
    query = query.skip(skipAmount).limit(limitAmount);

    if (request.query.page) {
      const numberOfTours = await Tour.countDocuments();
      if (skipAmount >= numberOfTours) {
        throw new Error("This page does not exist");
      }
    }

    //* execute query
    const tours = await query;

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
