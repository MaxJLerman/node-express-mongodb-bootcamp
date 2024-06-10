const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("../controllers/handlerFactory");

const filterObject = (object, ...allowedFields) => {
  const newObject = {};

  //? loops through all fields, check if it's in allowedFields, if it is then create new field in new object with same value from original object
  Object.keys(object).forEach((element) => {
    if (allowedFields.includes(element)) {
      newObject[element] = object[element];
    }
  });

  return newObject;
};

exports.getCurrentUser = (request, response, next) => {
  request.params.id = request.user.id;

  next();
};

exports.updateCurrentUser = catchAsync(async (request, response, next) => {
  //* create error if user POSTs password data
  if (request.body.password || request.body.confirmPassword) {
    return next(
      new AppError(
        "This route is not for password updates. Use /update-password instead.",
        400,
      ),
    );
  }

  //* filtered out unwanted field names from request body that aren't allowed to be updated
  const filteredBody = filterObject(request.body, "name", "email");

  //* update user document
  const updatedUser = await User.findByIdAndUpdate(
    request.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    },
  );

  response.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteCurrentUser = catchAsync(async (request, response, next) => {
  await User.findByIdAndUpdate(request.user.id, { active: false });

  response.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createUser = (request, response) => {
  response.status(500).json({
    status: "error",
    message: "route not defined, cheeky bugger",
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getOneUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User); //! DO NOT UPDATE PASSWORDS WITH THIS
exports.deleteUser = factory.deleteOne(User);
