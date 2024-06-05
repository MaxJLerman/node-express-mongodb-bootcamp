const { promisify } = require("util");
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
  const { name, email, role, password, confirmPassword, passwordChangedAt } =
    request.body;

  const newUser = await User.create({
    name,
    email,
    role,
    password,
    confirmPassword,
    passwordChangedAt,
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

exports.protect = catchAsync(async (request, response, next) => {
  //* grab token, check if it exists
  let token;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer")
  ) {
    token = request.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("User not logged in", 401));
  }

  //* verify token integrity
  const decodedData = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );

  //* check if user still exists
  const currentUser = await User.findById(decodedData.id);
  if (!currentUser) {
    return next(
      new AppError("User belonging to this token no longer exists", 401),
    );
  }

  //* checks if user has changed their password after the token was issued
  if (currentUser.changedPasswordAfter(decodedData.iat)) {
    return next(
      new AppError("User recently changed password, try logging in again", 401),
    );
  }

  //* now grant access to protected route
  request.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (request, response, next) => {
    if (!roles.includes(request.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (request, response, next) => {
  const user = await User.findOne({ email: request.body.email });
  if (!user) {
    return next(new AppError("There is no user with this email", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
});
exports.resetPassword = (request, response, next) => {};
