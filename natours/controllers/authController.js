const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (request, response, next) => {
  const { name, email, password, confirmPassword } = request.body;

  const newUser = await User.create({
    name,
    email,
    password,
    confirmPassword,
  });

  const token = signToken(newUser._id);

  response.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return next(new AppError("A user must provide an email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  //? if there is no user, 2nd half of IF statement won't be checked & function is skipped
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  const token = signToken(user._id);

  response.status(200).json({
    status: "success",
    token,
  });
});
