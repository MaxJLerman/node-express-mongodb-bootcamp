const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, response) => {
  const token = signToken(user._id);

  response.cookie("JWT", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  user.password = undefined; //? removes password from output

  response.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
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

  createSendToken(newUser, 201, response);
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

  createSendToken(user, 200, response);
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

  const resetURL = `${request.protocol}://${request.get(
    "host",
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? Sumbit a PATCH request with your new password + confirmPassword to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      message,
    });

    response.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("Something broke and we couldn't send that email", 500),
    );
  }
});

exports.resetPassword = catchAsync(async (request, response, next) => {
  //* get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(request.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //* if token not expired & there is a user, set new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = request.body.password;
  user.confirmPassword = request.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //* update changedPasswordAt property for user

  //* log user in, send JWT to user
  createSendToken(user, 200, response);
});

exports.updatePassword = catchAsync(async (request, response, next) => {
  //* get user from collection
  const user = await User.findById(request.user.id).select("+password"); //? include password select as it is not included in the response by default

  //* check if POSTed current password is correct
  if (
    !(await user.correctPassword(request.body.currentPassword, user.password))
  ) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  //* if so, update password
  user.password = request.body.password;
  user.confirmPassword = request.body.confirmPassword;
  await user.save();

  //* log user in, send JWT to user
  createSendToken(user, 200, response);
});
