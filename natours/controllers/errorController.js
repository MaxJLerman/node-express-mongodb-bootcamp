const AppError = require("../utils/appError");

const handleDatabaseCastError = (error) => {
  return new AppError(`Invalid ${error.path}: ${error.value}`, 400);
};

const handleDuplicateFields = (error) => {
  const duplicateFieldValue = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  return new AppError(
    `Duplicate field value: ${duplicateFieldValue}. Use another value.`,
    400,
  );
};

handleMongooseValidationError = (error) => {
  const errorMessages = Object.values(error.errors).map(
    (element) => element.message,
  );

  return new AppError(
    `Invalid input data, Mongoose validation failed: ${errorMessages.join(
      ". ",
    )}`,
    400,
  );
};

const sendDevelopmentError = (error, response) => {
  response.status(error.statusCode).json({
    error,
    status: error.status,
    message: error.message,
    stack: error.stack,
  });
};

const sendProductionError = (error, response) => {
  //? operational, trusted error: send message to client
  if (error.isOperational) {
    response.status(error.statusCode).json({
      message: error.message,
      stack: error.stack,
    });
  }
  //? programming or other unknown error: don't leak error details
  else {
    console.error("ERROR", error);

    response.status(500).json({
      status: "Error",
      message: "Something went wrong",
    });
  }
};

module.exports = (error, request, response, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendDevelopmentError(error, response);
  } else if (process.env.NODE_ENV === "production") {
    let errorCopy = { ...error };

    if (error.name === "CastError") {
      errorCopy = handleDatabaseCastError(error);
    }

    if (error.code === 11000) {
      errorCopy = handleDuplicateFields(error);
    }

    if (error.name === "ValidationError") {
      error = handleMongooseValidationError(error);
    }

    sendProductionError(errorCopy, response);
  }
};
