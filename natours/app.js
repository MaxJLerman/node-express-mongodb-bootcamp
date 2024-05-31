const express = require("express");
const morgan = require("morgan");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
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
  next(new AppError(`Can't find ${request.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
