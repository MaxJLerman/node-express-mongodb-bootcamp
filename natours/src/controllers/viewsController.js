const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");

exports.getOverview = catchAsync(async (request, response, next) => {
  const tours = await Tour.find();

  response.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTour = (request, response) => {
  response.status(200).render("tour", {
    title: "The Forest Hiker",
  });
};
