const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

app.use(morgan("dev")); //* morgan middleware
app.use(express.json()); //* middleware, in the middle of the request & response, gives us access to props on req parameter
app.use(express.static(`${__dirname}/public`));

//* custom muddlewares
app.use((req, res, next) => {
  console.log("hello from the middleware");
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/tours", tourRouter); //* using middleware function created in another file
//* now created a sub application (router system) for "tours" resource
app.use("/api/v1/users", userRouter);

module.exports = app;
