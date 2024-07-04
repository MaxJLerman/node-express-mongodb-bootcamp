import { connect } from "mongoose";
import { config } from "dotenv";

import app from "./app";

process.on("uncaughtException", (error) => {
  console.log("Uncaught Exception");
  console.log(error.name, error.message);
  process.exit(1);
});

config({ path: "./config.env" });

const database = process.env.DATABASE!.replace(
  "<DATABASE_PASSWORD>",
  process.env.DATABASE_PASSWORD!,
);
connect(database).then(() => {
  console.log("database connection successful");
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

process.on("unhandledRejection", (error: Error) => {
  console.log("Unhandled Rejection");
  console.log(error.name, error.message);
  server.close(() => {
    process.exit(1);
  });
});
