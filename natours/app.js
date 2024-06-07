const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const AppError = require("./src/utils/appError");
const globalErrorHandler = require("./src/controllers/errorController");
const tourRouter = require("./src/routes/tourRoutes");
const userRouter = require("./src/routes/userRoutes");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour.",
});
app.use("/api", limiter); //* middleware function only affects routes at /api

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
  next(new AppError(`Can't find ${request.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
