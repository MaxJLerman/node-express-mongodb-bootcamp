const sendErrorDevelopment = (error, response) => {
  response.status(error.statusCode).json({
    error,
    status: error.status,
    message: error.message,
    stack: error.stack,
  });
};

const sendErrorProduction = (error, response) => {
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

  if (provess.env.NODE_ENV === "development") {
    sendErrorDevelopment(error, response);
  } else if (provess.env.NODE_ENV === "production") {
    sendErrorProduction(error, response);
  }
};
