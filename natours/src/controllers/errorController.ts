import { NextFunction, Response } from "express";

import AppError from "@utils/appError";

const handleDatabaseCastError = (error: any) =>
  new AppError(`Invalid ${error.path}: ${error.value}`, 400);

const handleDuplicateFields = (error: any) => {
  const duplicateFieldValue = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  return new AppError(
    `Duplicate field value: ${duplicateFieldValue}. Use another value.`,
    400,
  );
};

const handleMongooseValidationError = (error: any) => {
  const errorMessages = Object.values(error.errors).map(
    (element: any) => element.message,
  );

  return new AppError(
    `Invalid input data, Mongoose validation failed: ${errorMessages.join(
      ". ",
    )}`,
    400,
  );
};

const handleJsonWebTokenError = () =>
  new AppError("Invalid token, try logging in again", 401);

const handleTokenExpiredError = () =>
  new AppError("Token expired, try logging in again", 401);

const sendDevelopmentError = (error: AppError, response: Response) => {
  response.status(error.statusCode).json({
    error,
    status: error.status,
    message: error.message,
    stack: error.stack,
  });
};

const sendProductionError = (error: AppError, response: Response) => {
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

const globalErrorHandler = (
  error: AppError,
  _request: Request,
  response: Response,
  _next: NextFunction,
) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env["NODE_ENV"] === "development") {
    sendDevelopmentError(error, response);
  } else if (process.env["NODE_ENV"] === "production") {
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

    if (error.name === "JsonWebTokenError") {
      error = handleJsonWebTokenError();
    }

    if (error.name === "TokenExpiredError") {
      error = handleTokenExpiredError();
    }

    sendProductionError(errorCopy, response);
  }
};

export default globalErrorHandler;
