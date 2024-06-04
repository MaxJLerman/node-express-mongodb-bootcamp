const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.signup = catchAsync(async (request, response, next) => {
  const { name, email, password, confirmPassword } = request.body;

  const newUser = await User.create({
    name,
    email,
    password,
    confirmPassword,
  });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  response.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});
