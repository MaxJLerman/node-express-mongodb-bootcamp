import path from "path";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

import xssClean from "./src/utils/xssClean";
import AppError from "./src/utils/appError";
import globalErrorHandler from "./src/controllers/errorController";
import tourRouter from "./src/routes/tourRoutes";
import userRouter from "./src/routes/userRoutes";
import reviewRouter from "./src/routes/reviewRoutes";
import viewRouter from "./src/routes/viewRoutes";

export type EnvVariable = NodeJS.ProcessEnv & {
  NODE_ENV: string;
  PORT: number;
  DATABASE: string;
  DATABASE_PASSWORD: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_COOKIE_EXPIRES_IN: number;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USERNAME: string;
  EMAIL_PASSWORD: string;
};

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "src/views"));

//? middleware functions == in the middle of the request & response, gives us access to props on request parameter

app.use(express.static(path.join(__dirname, "public"))); //? serving static files

app.use(helmet()); //* middleware function that helps secure Express apps by setting various HTTP headers

console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV?.trim().toLowerCase() === "development") {
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

app.use(xssClean()); //? data sanitisation against Cross Site Scripting (XSS)

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

app.use((request: Request, _response: Response, next: NextFunction) => {
  (request as any).requestTime = new Date().toISOString(); //! return later

  next();
});

app.use("/", viewRouter); //* using middleware function created in another file
app.use("/api/v1/tours", tourRouter); //* using middleware function created in another file
app.use("/api/v1/users", userRouter); //* now created a sub application (router system) for "tours" resource
app.use("/api/v1/reviews", reviewRouter);

app.all("*", (request: Request, _response: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${request.originalUrl} on the server`, 404));
});

// @ts-ignore
app.use(globalErrorHandler); //! return later

export default app;
