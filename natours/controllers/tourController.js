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

exports.getAllTours = (req, res) => {
  // res.status(200).json({
  //   status: "success",
  //   requestedAt: req.requestTime,
  //   results: tours.length,
  //   data: {
  //     tours,
  //   },
  // });
};

exports.getOneTour = (req, res) => {
  // const tour = tours.find((element) => element.id === req.params.id * 1);
  // res.status(200).json({
  //   status: "success",
  //   data: {
  //     tour,
  //   },
  // });
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

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      tour: "updated tour here",
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: "success",
    data: null,
  });
};
