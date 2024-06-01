const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });
const app = require("./app");

const database = process.env.DATABASE.replace(
  "<DATABASE_PASSWORD>",
  process.env.DATABASE_PASSWORD,
);
mongoose.connect(database).then(() => {
  console.log("database connection successful");
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

process.on("unhandledRejection", (error) => {
  console.log("Unhandled Rejection");
  console.log(error.name, error.message);
  server.close(() => {
    process.exit(1);
  });
});
