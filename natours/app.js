const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

const AppError = require("./src/utils/appError");
const globalErrorHandler = require("./src/controllers/errorController");
const tourRouter = require("./src/routes/tourRoutes");
const userRouter = require("./src/routes/userRoutes");
const xss = require("./src/utils/xssClean");

const app = express();

//? middleware functions == in the middle of the request & response, gives us access to props on request parameter

app.use(helmet()); //* middleware function that helps secure Express apps by setting various HTTP headers

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); //* middleware function for dev logging
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour.",
});
app.use("/api", limiter); //* middleware function only affects routes at /api, limits requests from same IP

app.use(express.json({ limit: "10kb" })); //? body parser, reads data from body into request.body

app.use(mongoSanitize()); //? data sanitisation against NoSQL Query Injection

app.use(xss()); //? data sanitisation against Cross Site Scripting (XSS)

//? prevents parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  }),
);

app.use(express.static(`${__dirname}/public`)); //? serving static files

app.use((request, response, next) => {
  request.requestTime = new Date().toISOString();

  next();
});

app.use("/api/v1/tours", tourRouter); //* using middleware function created in another file
app.use("/api/v1/users", userRouter); //* now created a sub application (router system) for "tours" resource

app.all("*", (request, response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
