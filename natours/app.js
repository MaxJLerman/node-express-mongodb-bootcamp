const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json()); //* middleware, in the middle of the request & response, gives us access to props on req parameter
app.use(express.static(`${__dirname}/public`));

app.use((request, response, next) => {
  request.requestTime = new Date().toISOString();

  next();
});

app.use("/api/v1/tours", tourRouter); //* using middleware function created in another file
//* now created a sub application (router system) for "tours" resource
app.use("/api/v1/users", userRouter);

app.all("*", (request, response, next) => {
  // response.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${request.originalUrl} on the server`,
  // });

  const err = new Error(`Can't find ${request.originalUrl} on the server`);
  err.status = "fail";
  err.statusCode = 404;

  next(err);
});

app.use((error, request, response, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  response.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
});

module.exports = app;
