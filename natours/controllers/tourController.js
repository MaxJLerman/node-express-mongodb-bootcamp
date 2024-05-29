const Tour = require("../models/tourModel");

//* no longer need the following two middleware functions, checks are handled by Mongoose Schema now
//* middleware function, so has access to "next", accepts id parameter so has access to "val" (value of id parameter)
exports.checkId = (req, res, next, val) => {
  const id = req.params.id * 1; //* converts string to number

  if (id > tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "invalid ID",
    });
  }

  next();
};

//* middleware function, so has access to "next"
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "fail",
      message: "missing name or price",
    });
  }

  next();
};

exports.getAllTours = async (req, res) => {
  try {
    //* filtering out protected fields
    const queryObject = { ...req.query };
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
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //* field limiting
    query = query.select("-__v"); //? firstly excluding the __v property provided by MongoDB
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    }

    //* pagination
    const page = req.query.page * 1 || 1;
    const limitAmount = req.query.limit * 1 || 100;
    const skipAmount = (page - 1) * limitAmount;
    query = query.skip(skipAmount).limit(limitAmount);

    if (req.query.page) {
      const numberOfTours = await Tour.countDocuments();
      if (skipAmount >= numberOfTours) {
        throw new Error("This page does not exist");
      }
    }

    //* execute query
    const tours = await query;

    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

exports.getOneTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error,
    });
  }
};
