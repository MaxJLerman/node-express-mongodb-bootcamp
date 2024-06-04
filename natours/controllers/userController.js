const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllUsers = catchAsync(async (request, response, next) => {
  const users = await User.find();

  response.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getOneUser = (request, response) => {
  response.status(500).json({
    status: "error",
    message: "route not yet defined",
  });
};

exports.createUser = (request, response) => {
  response.status(500).json({
    status: "error",
    message: "route not yet defined",
  });
};

exports.updateUser = (request, response) => {
  response.status(500).json({
    status: "error",
    message: "route not yet defined",
  });
};

exports.deleteUser = (request, response) => {
  response.status(500).json({
    status: "error",
    message: "route not yet defined",
  });
};
